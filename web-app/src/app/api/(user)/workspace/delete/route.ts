import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/models/workspace";
import { getToken } from "next-auth/jwt";
import User from "@/models/user";

export async function DELETE(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await request.json();

    if (!workspaceId) {
        return NextResponse.json({ message: "Workspace ID is required." }, { status: 400 });
    }

    try {
        await connectMongo();

        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        const workspace = await Workspace.findOneAndDelete({ _id: workspaceId, owner: userId });

        if (!workspace) {
            return NextResponse.json({ message: "Workspace not found or you do not have permission to delete it." }, { status: 404 });
        }

        user.workspaces = user.workspaces.filter((w: any) => w.toString() !== workspaceId);

        await user.save();

        return NextResponse.json({ message: "Workspace deleted successfully." }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }
    
}