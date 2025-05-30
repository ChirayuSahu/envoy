import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/modals/workspace";
import { getToken } from "next-auth/jwt";
import User from "@/modals/user";

export async function GET(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("id");

    if (workspaceId) {
        try {
            await connectMongo();

            const workspace = await Workspace.findOne({ _id: workspaceId, owner: userId })
                .populate({
                    path: "members",
                    select: "name email",
                    model: User
                })
                .lean();

            if (!workspace) {
                return NextResponse.json({ message: "Workspace not found." }, { status: 404 });
            }

            return NextResponse.json({ workspace }, { status: 200 });
        } catch (error) {
            console.error("Error fetching workspace:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    try {
        await connectMongo();

        const workspaces = await Workspace.find({ owner: userId })
            .populate({
                path: "members",
                select: "name email",
                model: User
            }).lean();

        if (!workspaces || workspaces.length === 0) {
            return NextResponse.json({ message: "No workspaces found." }, { status: 404 });
        }

        return NextResponse.json({ workspaces }, { status: 200 });
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}