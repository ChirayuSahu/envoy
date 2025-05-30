import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/modals/group";
import { getToken } from "next-auth/jwt";
import { randomUUID } from "crypto";
import Workspace from "@/modals/workspace";

export async function POST(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, workspaceId, isPublic } = await request.json();

    if (!workspaceId || !name) {
        return NextResponse.json({ error: "Workspace ID and name are required." }, { status: 400 });
    }

    
    try {
        await connectMongo();
        
        const workspace = await Workspace.findOne({ _id: workspaceId, owner: userId });
         
        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
        }

        let uuid = randomUUID();

        const existingToken = await Group.findOne({token: uuid});

        if (existingToken) {
            uuid = randomUUID();
        }

        const group = await Group.create({
            name,
            workspace: workspaceId,
            owner: userId,
            token: uuid,
            isPublic,
        });

        workspace.groups.push(group._id);

        await workspace.save();
        return NextResponse.json({ message: "Group created successfully.", group }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}