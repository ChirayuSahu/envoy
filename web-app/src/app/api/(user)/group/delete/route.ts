import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/modals/group";
import Workspace from "@/modals/workspace";
import { getToken } from "next-auth/jwt";

export async function DELETE(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;
    
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await request.json();

    if (!groupId) {
        return NextResponse.json({ error: "Group ID is required." }, { status: 400 });
    }

    try {

        await connectMongo();

        const group = await Group.findOneAndDelete({ _id: groupId, owner: userId });

        if (!group) {
            return NextResponse.json({ error: "Group not found or you do not have permission to delete it." }, { status: 404 });
        }

        const workspace = await Workspace.findById(group.workspace);

        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
        }

        workspace.groups = workspace.groups.filter((id: any) => id.toString() !== groupId);
        await workspace.save();

        return NextResponse.json({ message: "Group deleted successfully." }, { status: 200 });
        
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}