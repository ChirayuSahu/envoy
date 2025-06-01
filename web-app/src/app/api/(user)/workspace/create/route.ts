import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/models/workspace";
import { getToken } from "next-auth/jwt";
import User from "@/models/user";
import { generateShortUuid } from "custom-uuid";

export async function POST(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || !description) {
        return NextResponse.json({ message: "Name and description are required." }, { status: 400 });
    }

    try {

        await connectMongo();
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        let uuid = generateShortUuid();

        if( await Workspace.exists({ uuid })) {
            uuid = generateShortUuid();
        }

        const workspace = await Workspace.create({ name, description, owner: userId, uuid });
        
        user.workspaces.push(workspace._id);
        await user.save();

        return NextResponse.json({ message: "Workspace created successfully.", workspace }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }

}