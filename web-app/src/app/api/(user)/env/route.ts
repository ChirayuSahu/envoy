import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/modals/group";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, envs } = await request.json();

    if (!groupId || !envs || !Array.isArray(envs)) {
        return NextResponse.json({ error: "Group ID and environment variables are required." }, { status: 400 });
    }

    try {
        await connectMongo();
        
        const group = await Group.findOne({ _id: groupId, owner: userId });

        if (!group) {
            return NextResponse.json({ error: "Group not found or you do not have permission to access it." }, { status: 404 });
        }

        group.envs = envs;
        await group.save();

        return NextResponse.json({ message: "Environment variables updated successfully.", envs: group.envs }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}