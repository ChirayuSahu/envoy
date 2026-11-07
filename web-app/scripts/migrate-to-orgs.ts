/**
 * One-time migration: Workspaces → Groups  ⟶  Organizations → Teams → Projects → Environments.
 *
 *   npm run migrate:orgs -- --dry-run   # report what would change, write nothing
 *   npm run migrate:orgs                # apply
 *
 * Mapping:
 *   - Each user who owns workspaces gets an organization "<name>'s Org" (they're the owner).
 *   - Each workspace becomes a team. Its groups without extra members become projects in it.
 *   - Each group WITH members becomes its own team ("<workspace> / <group>") holding one project,
 *     so its members (added as viewers) can't see the workspace's other groups. Team roles apply
 *     to every project in a team, so merging them would widen access.
 *   - Group variables go into the project's "development" environment, re-encrypted to the
 *     current AES-256-GCM format. Staging and production start empty.
 *   - Public groups and group tokens are not carried over (tokens are replaced by personal API tokens).
 *   - Temporary share links older than 24 hours are deleted (links now last at most 24 hours).
 *
 * Idempotent: every created document records `migratedFrom`, and existing ones are reused.
 * Old Workspace/Group documents are left untouched.
 *
 * Secrets:
 *   ENCRYPTION_SECRET          encrypts the migrated values; must equal ENCRYPTION_SECRET on the server.
 *   LEGACY_ENCRYPTION_SECRETS  optional, comma-separated: the old NEXT_PUBLIC_ENCRYPTION_SECRET value(s)
 *                              the groups were encrypted with (e.g. production's, if it differs from yours).
 *   Old values are tried against ENCRYPTION_SECRET, then each legacy secret, then the old app's built-in
 *   default ("fallback-secret", used when the variable wasn't set).
 *
 * Re-running refills migrated "development" environments that nobody has saved since (version 0) from
 * their source group, so a run that couldn't decrypt values can be repaired by running again with the
 * right secret. Environments someone has edited are never overwritten; they're listed instead.
 * A dry run decrypts every value too, so it shows exactly what would fail.
 */
import mongoose from "mongoose";
import User from "../src/models/user";
import Workspace from "../src/models/workspace";
import Group from "../src/models/group";
import Organization from "../src/models/organization";
import OrgMembership from "../src/models/orgMembership";
import Team from "../src/models/team";
import TeamMembership from "../src/models/teamMembership";
import Project from "../src/models/project";
import Environment, { DEFAULT_ENVIRONMENTS } from "../src/models/environment";
import BasicGroup from "../src/models/basicGroup";
import CryptoJS from "crypto-js";
import { decrypt, encrypt } from "../src/utils/encryption";
import { slugify } from "../src/lib/slug";

const DRY = process.argv.includes("--dry-run");

try {
    process.loadEnvFile(".env.local");
} catch {
    /* rely on the real environment */
}

const stats = {
    orgs: 0,
    teams: 0,
    projects: 0,
    members: 0,
    vars: 0,
    refilled: 0,
    skippedEdited: [] as string[],
    skippedPublic: [] as string[],
    failedValues: 0,
};

/** Secrets the old app may have encrypted with, in the order they're tried. */
function legacySecrets() {
    const list = [process.env.ENCRYPTION_SECRET, ...(process.env.LEGACY_ENCRYPTION_SECRETS ?? "").split(","), "fallback-secret"];
    return [...new Set(list.map((v) => v?.trim()).filter((v): v is string => !!v))];
}

/** A wrong key can occasionally "decrypt" to junk; real env values are printable text. */
const looksLikeText = (v: string) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/.test(v);

/** Decrypts any stored format: current AES-GCM, old CryptoJS (trying each known secret), or plain text. */
function decryptAny(value: string): string {
    if (value.startsWith("enc:v1:")) return decrypt(value);
    if (!value.startsWith("U2Fsd")) return value; // stored before values were encrypted
    for (const secret of legacySecrets()) {
        try {
            const plain = CryptoJS.AES.decrypt(value, secret).toString(CryptoJS.enc.Utf8);
            if (plain && looksLikeText(plain)) return plain;
        } catch {
            /* wrong key: try the next one */
        }
    }
    throw new Error("no known secret decrypts this value");
}

async function uniqueSlug(base: string, taken: (s: string) => Promise<unknown>) {
    const root = slugify(base);
    if (!(await taken(root))) return root;
    for (let i = 2; i < 1000; i++) if (!(await taken(`${root}-${i}`))) return `${root}-${i}`;
    throw new Error(`No free slug for ${base}`);
}

async function findOrCreate<T>(model: mongoose.Model<any>, migratedFrom: string, create: () => Promise<Record<string, unknown>>, label: string) {
    const existing = await model.findOne({ migratedFrom });
    if (existing) return existing as T & { _id: mongoose.Types.ObjectId };
    const doc = await create();
    console.log(`${DRY ? "[dry-run] would create" : "create"} ${label}: ${doc.name ?? ""}`);
    if (DRY) return { ...doc, _id: new mongoose.Types.ObjectId() } as any;
    return (await model.create({ ...doc, migratedFrom })) as any;
}

async function ensureOrgMember(org: unknown, user: unknown, role: "owner" | "member") {
    if (DRY) return;
    const res = await OrgMembership.updateOne({ org, user }, { $setOnInsert: { org, user, role } }, { upsert: true });
    if (res.upsertedCount) stats.members++;
}

async function ensureTeamMember(team: unknown, org: unknown, user: unknown) {
    if (DRY) return;
    await TeamMembership.updateOne({ team, user }, { $setOnInsert: { team, org, user, role: "viewer" } }, { upsert: true });
}

function reencrypt(envs: { key: string; value: string }[], groupName: string) {
    const seen = new Set<string>();
    const out: { key: string; value: string }[] = [];
    for (const e of envs ?? []) {
        if (!e?.key || seen.has(e.key)) continue;
        seen.add(e.key);
        try {
            out.push({ key: e.key, value: encrypt(decryptAny(String(e.value ?? ""))) });
        } catch {
            stats.failedValues++;
            console.warn(`  ! could not decrypt ${groupName}/${e.key}: add the secret it was encrypted with to LEGACY_ENCRYPTION_SECRETS`);
        }
    }
    return out;
}

async function migrateGroup(group: any, team: any, org: any, workspaceName: string) {
    const project: any = await findOrCreate(
        Project,
        `group:${group._id}`,
        async () => ({
            org: org._id,
            team: team._id,
            name: group.name,
            slug: await uniqueSlug(group.name, (s) => (DRY ? Promise.resolve(null) : Project.exists({ team: team._id, slug: s }))),
        }),
        "project"
    );
    stats.projects++;

    if (group.isPublic) stats.skippedPublic.push(`${workspaceName} / ${group.name}`);

    // Decrypt in dry runs too, so a dry run proves every value can be read.
    const vars = reencrypt(group.envs, group.name);
    stats.vars += vars.length;
    if (DRY) return;

    if (!(await Environment.exists({ project: project._id }))) {
        await Environment.insertMany(
            DEFAULT_ENVIRONMENTS.map((e, i) => ({
                ...e,
                position: i,
                project: project._id,
                org: org._id,
                vars: e.slug === "development" ? vars : [],
            }))
        );
        return;
    }

    // Already migrated: refill development from the source group, unless someone has saved it since.
    const dev: any = await Environment.findOne({ project: project._id, slug: "development" });
    if (!dev) return;
    if ((dev.version ?? 0) > 0) {
        stats.skippedEdited.push(`${workspaceName} / ${group.name}`);
        return;
    }
    await Environment.updateOne({ _id: dev._id, version: 0 }, { $set: { vars } });
    stats.refilled++;
}

async function main() {
    const uri = process.env.NEXT_MONGO_URI;
    if (!uri) throw new Error("NEXT_MONGO_URI is not set");
    if (!process.env.ENCRYPTION_SECRET) throw new Error("ENCRYPTION_SECRET is not set (use the same value as on the server)");

    // A dry run must not even create collections or indexes, so automatic index building is off for it.
    await mongoose.connect(uri, DRY ? { autoIndex: false, autoCreate: false } : {});
    console.log(`Connected to ${mongoose.connection.name}${DRY ? " (dry run, nothing will be written)" : ""}\n`);

    const workspaces: any[] = await Workspace.find({}).lean();
    const owners = [...new Set(workspaces.map((w) => String(w.owner)))];

    for (const ownerId of owners) {
        const owner: any = await User.findById(ownerId).lean();
        if (!owner) {
            console.warn(`! skipping workspaces of missing user ${ownerId}`);
            continue;
        }

        const org: any = await findOrCreate(
            Organization,
            `user:${ownerId}`,
            async () => ({
                name: `${owner.name}'s Org`.slice(0, 64),
                slug: await uniqueSlug(owner.name || owner.email.split("@")[0], (s) => (DRY ? Promise.resolve(null) : Organization.exists({ slug: s }))),
                owner: owner._id,
            }),
            "organization"
        );
        stats.orgs++;
        await ensureOrgMember(org._id, owner._id, "owner");
        if (!DRY && !owner.lastOrgSlug) await User.updateOne({ _id: owner._id }, { lastOrgSlug: org.slug });

        for (const ws of workspaces.filter((w) => String(w.owner) === ownerId)) {
            const groups: any[] = await Group.find({ workspace: ws._id }).lean();
            const shared = groups.filter((g) => (g.members ?? []).length > 0);
            const privateGroups = groups.filter((g) => !(g.members ?? []).length);

            const makeTeam = (migratedFrom: string, name: string, description?: string) =>
                findOrCreate(
                    Team,
                    migratedFrom,
                    async () => ({
                        org: org._id,
                        name: name.slice(0, 64),
                        description,
                        slug: await uniqueSlug(name, (s) => (DRY ? Promise.resolve(null) : Team.exists({ org: org._id, slug: s }))),
                    }),
                    "team"
                );

            if (privateGroups.length || !shared.length) {
                const team: any = await makeTeam(`workspace:${ws._id}`, ws.name, ws.description);
                stats.teams++;
                for (const g of privateGroups) await migrateGroup(g, team, org, ws.name);
            }

            for (const g of shared) {
                const team: any = await makeTeam(`group-team:${g._id}`, `${ws.name} / ${g.name}`);
                stats.teams++;
                for (const memberId of g.members) {
                    if (String(memberId) === ownerId) continue;
                    if (!(await User.exists({ _id: memberId }))) continue;
                    await ensureOrgMember(org._id, memberId, "member");
                    await ensureTeamMember(team._id, org._id, memberId);
                }
                await migrateGroup(g, team, org, ws.name);
            }
        }
    }

    // Temporary links now live at most 24 hours; remove older ones created with longer lifetimes.
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const staleShares = await BasicGroup.countDocuments({ createdAt: { $lt: cutoff } });
    if (!DRY && staleShares) await BasicGroup.deleteMany({ createdAt: { $lt: cutoff } });

    console.log("\nSummary");
    console.log(`  organizations: ${stats.orgs}`);
    console.log(`  teams:         ${stats.teams}`);
    console.log(`  projects:      ${stats.projects}`);
    console.log(`  variables:     ${stats.vars}${DRY ? " (decrypted successfully)" : ""}`);
    if (!DRY) console.log(`  development environments refilled: ${stats.refilled}`);
    console.log(`  expired share links ${DRY ? "to delete" : "deleted"}: ${staleShares}`);
    console.log(`  new members:   ${DRY ? "(not counted in dry run)" : stats.members}`);
    console.log(`  values that failed to decrypt: ${stats.failedValues}`);
    if (stats.skippedEdited.length) {
        console.log("\nThese projects were edited after migrating, so their development values were left as they are:");
        stats.skippedEdited.forEach((g) => console.log(`  - ${g}`));
    }
    if (stats.skippedPublic.length) {
        console.log("\nThese groups were public. They are now private; share them with invite links or a temporary link (max 24 hours):");
        stats.skippedPublic.forEach((g) => console.log(`  - ${g}`));
    }

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
});
