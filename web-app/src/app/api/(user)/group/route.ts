import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/modals/group";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const groupToken = searchParams.get("token");

    try {
        await connectMongo();

        const group = await Group.findOne({ token: groupToken });

        if (!group) {
            return NextResponse.json({ error: "Group not found." }, { status: 404 });
        }

        if(group.isPublic){
            return NextResponse.json({ group }, { status: 200 });
        }

        if( group.members.map( (member: any) => member.toString() ).includes(userId) ){
            return NextResponse.json({ group }, { status: 200 });
        }

        return NextResponse.json({ error: "You do not have permission to access this group." }, { status: 403 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}