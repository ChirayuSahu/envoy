import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { badRequest, json, parseBody, route } from "@/lib/http";
import { passwordSchema } from "@/lib/validation";
import { comparePassword, hashPassword } from "@/utils/bcrypt";
import User from "@/models/user";

const schema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema });

/** Changes the password and signs out every session (including this one). */
export const POST = route(async (req: NextRequest) => {
    const me = await requireUser(req);
    const { currentPassword, newPassword } = await parseBody(req, schema);

    const user = await User.findById(me.id).select("+password provider");
    if (!user.password) throw badRequest("This account signs in with Google and has no password.");
    if (!(await comparePassword(currentPassword, user.password))) {
        throw badRequest("Current password is incorrect.", "invalid_password");
    }

    await User.updateOne(
        { _id: me.id },
        { $set: { password: await hashPassword(newPassword) }, $inc: { sessionVersion: 1 } }
    );
    return json({ message: "Password changed. Please sign in again." });
});
