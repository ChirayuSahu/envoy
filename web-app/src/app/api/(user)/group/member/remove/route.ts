import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import User from "@/models/user";
import { getToken } from "next-auth/jwt";
import { generalLimiter, getUserIP } from "@/utils/limiter";

export async function POST(request: NextRequest) {

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

    const { groupId, memberEmail } = await request.json();

    if (!groupId || !memberEmail) {
        return NextResponse.json({ message: "Group ID and member email are required." }, { status: 400 });
    }

    try {

        await connectMongo();

        const group = await Group.findOne({ _id: groupId, owner: userId });

        if (!group) {
            return NextResponse.json({ message: "Group not found or you do not have permission to access it." }, { status: 404 });
        }

        const member = await User.findOne({ email: memberEmail });

        if (!member) {
            return NextResponse.json({ message: "Member not found with provided email." }, { status: 404 });
        }

        if (group.members.map((member: any) => !member.toString()).includes(member._id.toString())) {
            return NextResponse.json({ message: "Member does not exist in the group." }, { status: 400 });
        }

        if (member._id.toString() === group.owner.toString()) {
            return NextResponse.json({ message: "You cannot remove the group owner from the group." }, { status: 400 });
        }

        group.members = group.members.filter((m: any) => m.toString() !== member._id.toString());
        await group.save();

        member.otherGroups = member.otherGroups.filter((g: any) => g.toString() !== groupId);
        await member.save();

        return NextResponse.json({ message: "Member removed successfully." }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }

}