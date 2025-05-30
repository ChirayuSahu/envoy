import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/modals/workspace";
import { getToken } from "next-auth/jwt";
import User from "@/modals/user";

export async function POST(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || !description) {
        return NextResponse.json({ error: "Name and description are required." }, { status: 400 });
    }

    try {

        await connectMongo();
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }
        
        const workspace = await Workspace.create({ name, description, owner: userId });
        
        user.workspaces.push(workspace._id);
        await user.save();

        return NextResponse.json({ message: "Workspace created successfully.", workspace }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}