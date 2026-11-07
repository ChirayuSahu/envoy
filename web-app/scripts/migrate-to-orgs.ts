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
import { decrypt, encrypt } from "../src/utils/encryption";
import { slugify } from "../src/lib/slug";

const DRY = process.argv.includes("--dry-run");

try {
    process.loadEnvFile(".env.local");
} catch {
    /* rely on the real environment */
}

const stats = { orgs: 0, teams: 0, projects: 0, members: 0, vars: 0, skippedPublic: [] as string[], failedValues: 0 };

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
            out.push({ key: e.key, value: encrypt(decrypt(e.value)) });
        } catch {
            stats.failedValues++;
            console.warn(`  ! could not decrypt ${groupName}/${e.key}; is ENCRYPTION_SECRET the old NEXT_PUBLIC_ENCRYPTION_SECRET value?`);
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

    if (!DRY && !(await Environment.exists({ project: project._id }))) {
        const vars = reencrypt(group.envs, group.name);
        stats.vars += vars.length;
        await Environment.insertMany(
            DEFAULT_ENVIRONMENTS.map((e, i) => ({
                ...e,
                position: i,
                project: project._id,
                org: org._id,
                vars: e.slug === "development" ? vars : [],
            }))
        );
    } else if (DRY) {
        stats.vars += group.envs?.length ?? 0;
    }
}

async function main() {
    const uri = process.env.NEXT_MONGO_URI;
    if (!uri) throw new Error("NEXT_MONGO_URI is not set");
    if (!process.env.ENCRYPTION_SECRET) throw new Error("ENCRYPTION_SECRET is not set (use the old NEXT_PUBLIC_ENCRYPTION_SECRET value)");

    await mongoose.connect(uri);
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
    console.log(`  variables:     ${stats.vars}`);
    console.log(`  expired share links ${DRY ? "to delete" : "deleted"}: ${staleShares}`);
    console.log(`  new members:   ${DRY ? "(not counted in dry run)" : stats.members}`);
    if (stats.failedValues) console.log(`  values that failed to decrypt: ${stats.failedValues}`);
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
