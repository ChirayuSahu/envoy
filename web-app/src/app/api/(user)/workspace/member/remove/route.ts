import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/modals/workspace";
import User from "@/modals/user";
import { getToken } from "next-auth/jwt";

export async function DELETE(request: NextRequest) {

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

        const workspace = await Workspace.findOne({ _id: workspaceId, owner: userId });

        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found or you do not have permission to remove members." }, { status: 404 });
        }

        const member = await User.findOne({ email: memberEmail });

        if (!member) {
            return NextResponse.json({ error: "Member not found with provided Email." }, { status: 404 });
        }

        if (!workspace.members.includes(member._id)) {
            return NextResponse.json({ error: "Member does not exist in the workspace." }, { status: 400 });
        }

        workspace.members = workspace.members.filter((m: any) => m.toString() !== member._id.toString());

        await workspace.save();

        return NextResponse.json({ message: "Member removed successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error removing member:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
