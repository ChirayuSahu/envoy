import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import { getToken } from "next-auth/jwt";
import { encrypt } from "@/utils/encryption";
import { generalLimiter } from "@/utils/limiter";
import { getUserIP } from "@/utils/limiter";

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;
    const ip = await getUserIP(request);


    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await generalLimiter.consume(ip);
    } catch (error) {
        return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { groupToken, envs } = await request.json();

    if (!groupToken || !envs) {
        return NextResponse.json({ message: "Group token and environment variables are required." }, { status: 400 });
    }

    if (!Array.isArray(envs) || !envs.every(e => e.key && e.value)) {
        return NextResponse.json({ message: "Invalid envs format." }, { status: 400 });
    }

    try {
        await connectMongo();

        const group = await Group.findOne({ token: groupToken, owner: userId });

        if (!group) {
            return NextResponse.json({ message: "Group not found or you do not have permission to access it." }, { status: 404 });
        }

        group.envs = envs.map(({ key, value }) => ({
            key,
            value: encrypt(value)
        }));
        await group.save();

        return NextResponse.json({ message: "Environment variables updated successfully.", envs: group.envs }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }
}