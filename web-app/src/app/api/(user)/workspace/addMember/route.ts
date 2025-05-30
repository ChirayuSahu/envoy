import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/modals/workspace";
import User from "@/modals/user";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, memberEmail } = await request.json();

    if (!workspaceId || !memberEmail) {
        return NextResponse.json({ error: "Workspace ID and member email are required." }, { status: 400 });
    }

    try {
        
        await connectMongo();

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace || workspace.owner.toString() !== userId) {
            return NextResponse.json({ error: "Workspace not found or you do not have permission to add members." }, { status: 404 });
        }

        const member = await User.findOne({ email: memberEmail });

        if (!member) {
            return NextResponse.json({ error: "Member not found with provided Email." }, { status: 404 });
        }

        if (workspace.members.includes(member._id)) {
            return NextResponse.json({ error: "Member already exists in the workspace." }, { status: 400 });
        }

        workspace.members.push(member._id);
        await workspace.save();

        return NextResponse.json({ message: "Member added successfully.", workspace }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}