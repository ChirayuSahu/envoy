import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/models/workspace";
import Group from "@/models/group";
import { getToken } from "next-auth/jwt";
import { generalLimiter, getUserIP } from "@/utils/limiter";

export async function GET(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const ip = getUserIP(request);
        await generalLimiter.consume(ip);
    } catch (error) {
        return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceUUID = searchParams.get("id");

    await connectMongo();

    if (workspaceUUID) {
        try {
            const workspace = await Workspace.findOne({
                uuid: workspaceUUID,
                owner: userId,
            }).populate({
                path: "groups",
                model: Group,
                select: "-envs",
            });

            if (!workspace) {
                return NextResponse.json({ message: "Workspace not found." }, { status: 404 });
            }

            return NextResponse.json({ workspace }, { status: 200 });
        } catch (error) {
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
        }
    }

    try {
        const workspaces = await Workspace.find({ owner: userId })
            .populate({
                path: "groups",
                select: "name token",
                model: Group,
            });

        if (!workspaces || workspaces.length === 0) {
            return NextResponse.json({ workspaces: [], message: "No workspaces found." }, { status: 200 });
        }

        return NextResponse.json({ workspaces }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
