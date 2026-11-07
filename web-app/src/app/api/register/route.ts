import { NextRequest } from "next/server";
import { z } from "zod";
import User from "@/models/user";
import { hashPassword } from "@/utils/bcrypt";
import { json, parseBody, rateLimit, route, conflict } from "@/lib/http";
import { emailSchema, nameSchema, passwordSchema } from "@/lib/validation";

const schema = z.object({
    name: nameSchema,
    username: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9_.-]{3,32}$/, "Username must be 3–32 characters: letters, numbers, _ . -"),
    email: emailSchema,
    password: passwordSchema,
});

export const POST = route(async (req: NextRequest) => {
    await rateLimit(req);
    const { name, username, email, password } = await parseBody(req, schema);

    const existing = await User.findOne({ $or: [{ email }, { username }] }).select("email username");
    if (existing) {
        throw conflict(
            existing.email === email
                ? "An account with this email already exists."
                : "That username is taken.",
            "account_exists"
        );
    }

    await User.create({
        name,
        username,
        email,
        password: await hashPassword(password),
        provider: "credentials",
        // No email service yet: password accounts stay unverified and can only join orgs via invite links.
        emailVerified: false,
    });

    return json({ message: "Account created." }, 201);
});
