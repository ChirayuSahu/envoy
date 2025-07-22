import { NextRequest, NextResponse } from "next/server";
import Group from "@/models/group";
import connectMongo from "@/utils/connectMongo";
import { getToken } from "next-auth/jwt";
import { generalLimiter, getUserIP } from "@/utils/limiter";

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userIP = getUserIP(request);
        await generalLimiter.consume(userIP);
    } catch (error) {
        return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { groupToken } = await request.json();

    if (!groupToken) {
        return NextResponse.json({ error: "Group token is required." }, { status: 400 });
    }

    try {
        await connectMongo();

        const group = await Group.findOne({ token: groupToken, owner: userId });

        if (!group) {
            return NextResponse.json({ error: "Group not found or you do not have access." }, { status: 404 });
        }

        group.isPublic = !group.isPublic;

        await group.save();

        return NextResponse.json({ message: "Group visibility updated.", isPublic: group.isPublic }, { status: 200 });
    } catch (error) {
        console.error("Error updating group visibility:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}