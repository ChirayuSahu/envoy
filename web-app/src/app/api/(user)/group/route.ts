import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import { getToken } from "next-auth/jwt";
import BasicGroup from "@/models/basicGroup";

export async function GET(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupToken = searchParams.get("token");
    const type = searchParams.get("type");

    if (type === "basic") {
        try {
            await connectMongo();
            const group = await BasicGroup.findOne({ token: groupToken });

            if (!group) {
                return NextResponse.json({ message: "Group not found." }, { status: 404 });
            }

            return NextResponse.json({ group }, { status: 200 });

        } catch (error: any) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
    }

    try {
        await connectMongo();

        const group = await Group.findOne({ token: groupToken }).populate({ path: "members", select: "name email" });

        if (!group) {
            return NextResponse.json({ message: "Group not found." }, { status: 404 });
        }

        if (group.isPublic) {
            return NextResponse.json({ group }, { status: 200 });
        }

        if (group.owner.toString() === userId) {
            return NextResponse.json({ group }, { status: 200 });
        }

        return NextResponse.json({ message: "You do not have permission to access this group." }, { status: 403 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

}