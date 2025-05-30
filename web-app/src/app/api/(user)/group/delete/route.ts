import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import Workspace from "@/models/workspace";
import { getToken } from "next-auth/jwt";
import User from "@/models/user";

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

        await User.updateMany(
            { _id: { $in: group.members } },
            { $pull: { otherGroups: groupId } }
        );

        return NextResponse.json({ message: "Group deleted successfully." }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}