import { NextRequest } from "next/server";
import { z } from "zod";
import Environment from "@/models/environment";
import User from "@/models/user";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { assertCanEdit, loadEnvironment, loadOrg, loadProject, loadTeam } from "@/lib/authz";
import { conflict, json, parseBody, route } from "@/lib/http";
import { envVarsSchema } from "@/lib/validation";
import { decrypt, encrypt } from "@/utils/encryption";

type P = { org: string; team: string; project: string; env: string };

const schema = z.object({ vars: envVarsSchema, version: z.number().int().min(0) });

/**
 * Replaces the environment's variables. `version` must match the stored version
 * (optimistic concurrency) so two editors can't silently overwrite each other.
 * The audit log records key names that were added/changed/removed, never values.
 */
export const PUT = route<P>(async (req: NextRequest, { params }) => {
    const me = await requireUser(req);
    const ctx = await loadEnvironment(
        await loadProject(await loadTeam(await loadOrg(params.org, me), params.team, me), params.project),
        params.env
    );
    assertCanEdit(ctx.access);
    const { vars, version } = await parseBody(req, schema);

    const previous = new Map<string, string>(
        (ctx.environment.vars ?? []).map((v: any) => [v.key, decrypt(v.value)])
    );
    const next = new Map(vars.map((v) => [v.key, v.value]));
    const added = [...next.keys()].filter((k) => !previous.has(k));
    const removed = [...previous.keys()].filter((k) => !next.has(k));
    const changed = [...next.keys()].filter((k) => previous.has(k) && previous.get(k) !== next.get(k));

    const updated = await Environment.findOneAndUpdate(
        { _id: ctx.environment._id, version },
        {
            $set: { vars: vars.map(({ key, value }) => ({ key, value: encrypt(value) })), updatedBy: me.id },
            $inc: { version: 1 },
        },
        { new: true }
    );

    if (!updated) {
        const current = await Environment.findById(ctx.environment._id).select("updatedBy updatedAt");
        const by = current?.updatedBy ? await User.findById(current.updatedBy).select("name") : null;
        throw conflict(
            `These variables were changed${by ? ` by ${by.name}` : ""} since you loaded them. Reload to see the latest version.`,
            "version_conflict"
        );
    }

    if (added.length || removed.length || changed.length) {
        await audit(
            ctx.org,
            me,
            "vars.update",
            { type: "environment", id: String(ctx.environment._id), name: `${ctx.team.name}/${ctx.project.name}/${ctx.environment.name}` },
            { added, removed, changed },
            req
        );
    }

    return json({ version: updated.version, updatedAt: updated.updatedAt, added, removed, changed });
});
