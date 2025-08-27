import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google";
import connectMongo from "@/utils/connectMongo";
import User from "@/models/user";
import { comparePassword } from "@/utils/bcrypt";
import { sanitizeFilter } from "mongoose";
import { loginLimiter } from "@/utils/limiter";
import { getUserIP } from "@/utils/limiter";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req: any) {
                if (!credentials) {
                    throw new Error("No credentials provided");
                }

                const ip = getUserIP(req);

                await loginLimiter.consume(ip);

                try {
                    await connectMongo();

                    const user = await User.findOne(sanitizeFilter({
                        $or: [
                            { email: credentials.username },
                            { username: credentials.username }
                        ]
                    })).select("+password");

                    if (!user) {
                        await loginLimiter.consume(ip);
                        return null;
                    }

                    if (user.provider !== "credentials") {
                        throw new Error("User does not use credentials for authentication. Try signing in with Google.");
                    }

                    const isPasswordValid = await comparePassword(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        await loginLimiter.consume(ip);
                        return null;
                    }

                    await loginLimiter.delete(ip);

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                    };
                } catch (error: any) {

                    if (error?.msBeforeNext) {
                        const retrySecs = Math.ceil(error.msBeforeNext / 1000);
                        throw new Error(`Too many login attempts. Try again in ${retrySecs}s.`);
                    }

                    throw new Error((error as Error).message || "Authentication failed");
                }
            }
        }), Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile: (profile) => {
                return {
                    id: profile.sub || profile.id || profile.email,
                    name: profile.name || profile.email,
                    email: profile.email,
                };
            },
        }),

    ],

    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user, account, profile }) {
            await connectMongo();

            if (account?.provider === "google") {
                const email = profile?.email || token.email;
                const name = profile?.name || token.name;

                const existingUser = await User.findOne({ email });

                if (!existingUser) {
                    const newUser = await User.create({
                        name,
                        email,
                        provider: "google",
                    });

                    token.id = newUser._id.toString();
                    token.email = newUser.email;
                    token.name = newUser.name;
                } else {
                    token.id = existingUser._id.toString();
                    token.email = existingUser.email;
                    token.name = existingUser.name;
                }
            }

            if (user && account?.provider === "credentials") {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }

            return token;
        },

        async session({ session, token }) {
            if (token?.id) {
                session.user.id = token.id.toString();
                session.user.email = token.email ?? session.user.email;
                session.user.name = token.name ?? session.user.name;
            }

            return session;
        },
    }


}