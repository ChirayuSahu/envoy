import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import { getToken } from "next-auth/jwt";
import BasicGroup from "@/models/basicGroup";
import { generalLimiter, getUserIP } from "@/utils/limiter";

export async function GET(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    const { searchParams } = new URL(request.url);
    const groupToken = searchParams.get("token");
    const type = searchParams.get("type");

    if (!groupToken) {
        return NextResponse.json({ message: "Group token is required." }, { status: 400 });
    }

    try {
        const userIP = getUserIP(request);
        await generalLimiter.consume(userIP);
    } catch (error) {
        return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    if (type === "basic") {
        try {
            await connectMongo();
            const group = await BasicGroup.findOne({ token: groupToken });

            if (!group) {
                return NextResponse.json({ message: "Group not found." }, { status: 404 });
            }

            return NextResponse.json({ group }, { status: 200 });

        } catch (error: any) {
            return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
        }
    }

    try {
        await connectMongo();

        const group = await Group.findOne({ token: groupToken }).populate([
            { path: "members", select: "name email" },
            { path: "owner", select: "name email" },
        ]);

        if (!group) {
            return NextResponse.json({ message: "Group not found." }, { status: 404 });
        }

        if (group.isPublic) {
            return NextResponse.json({ group }, { status: 200 });
        }

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (group.owner._id.toString() === userId) {
            return NextResponse.json({ group }, { status: 200 });
        }

        if (group.members.map((member: any) => member._id.toString()).includes(userId.toString())) {
            return NextResponse.json({ group }, { status: 200 });
        }


        return NextResponse.json({ message: "You do not have permission to access this group." }, { status: 403 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }

}