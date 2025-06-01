import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if(!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupToken = searchParams.get("token");

    if (!groupToken) {
        return NextResponse.json({ message: "Group token is required" }, { status: 400 });
    }

    try {

        await connectMongo();
        const group = await Group.findOne({ token: groupToken, owner: userId }).populate({ path: "members", select: "name email" });

        if (!group) {
            return NextResponse.json({ message: "Group not found or you do not have permission to view it" }, { status: 404 });
        }

        const members = group.members.filter((member: any) => member._id.toString() !== userId);

        return NextResponse.json({ group: group._id, members }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({  message: error.message }, { status: 500 });
    }

}