import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/modals/group";
import { getToken } from "next-auth/jwt";
import User from "@/modals/user";

export async function POST(request: NextRequest){

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, memberEmail } = await request.json();

    if (!groupId || !memberEmail) {
        return NextResponse.json({ error: "Group ID and member email are required." }, { status: 400 });
    }

    try {
        await connectMongo();

        const group = await Group.findOne({ _id: groupId, owner: userId });

        if (!group) {
            return NextResponse.json({ error: "Group not found or you do not have permission to access it." }, { status: 404 });
        }

        const member = await User.findOne({ email: memberEmail });

        if (!member) {
            return NextResponse.json({ error: "Member not found with provided email." }, { status: 404 });
        }

        if(group.members.map((member: any) => member.toString()).includes(member._id.toString())) {
            return NextResponse.json({ error: "Member already exists in the group." }, { status: 400 });
        }

        group.members.push(member._id);
        await group.save();

        member.groups.push(group._id);
        await member.save();

        return NextResponse.json({ message: "Member added successfully." }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}