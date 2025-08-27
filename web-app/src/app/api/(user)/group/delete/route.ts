import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import Workspace from "@/models/workspace";
import { getToken } from "next-auth/jwt";
import User from "@/models/user";
import { generalLimiter, getUserIP } from "@/utils/limiter";

export async function DELETE(request: NextRequest) {

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

    const { groupId } = await request.json();

    if (!groupId) {
        return NextResponse.json({ message: "Group ID is required." }, { status: 400 });
    }

    try {

        await connectMongo();

        const group = await Group.findOneAndDelete({ _id: groupId, owner: userId });

        if (!group) {
            return NextResponse.json({ message: "Group not found or you do not have permission to delete it." }, { status: 404 });
        }

        const workspace = await Workspace.findById(group.workspace);

        if (!workspace) {
            return NextResponse.json({ message: "Workspace not found." }, { status: 404 });
        }

        workspace.groups = workspace.groups.filter((id: any) => id.toString() !== groupId);
        await workspace.save();

        if (Array.isArray(group.members) && group.members.length > 0) {
            await User.updateMany(
                { _id: { $in: group.members } },
                { $pull: { otherGroups: group._id } }
            );
        }


        return NextResponse.json({ message: "Group deleted successfully." }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

}