import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import { getToken } from "next-auth/jwt";
import { randomUUID } from "crypto";
import Workspace from "@/models/workspace";
import User from "@/models/user";

export async function POST(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, workspaceId, isPublic } = await request.json();

    if (!workspaceId || !name) {
        return NextResponse.json({ message: "Workspace ID and name are required." }, { status: 400 });
    }

    
    try {
        await connectMongo();
        
        const workspace = await Workspace.findOne({ _id: workspaceId, owner: userId });
         
        if (!workspace) {
            return NextResponse.json({ message: "Workspace not found." }, { status: 404 });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        let uuid = randomUUID();

        const existingToken = await Group.exists({token: uuid});

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

        user.otherGroups.push(group._id);
        await user.save();

        group.members.push(userId);
        await group.save();

        return NextResponse.json({ message: "Group created successfully.", group }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }

}