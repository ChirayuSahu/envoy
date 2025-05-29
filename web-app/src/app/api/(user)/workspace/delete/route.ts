import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/modals/workspace";
import { getToken } from "next-auth/jwt";

export async function DELETE(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;
    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ error: "Workspace ID is required." }, { status: 400 });
    }

    try {
        await connectMongo();
        const workspace = await Workspace.findOneAndDelete({ _id: id, owner: userId });

        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found or you do not have permission to delete it." }, { status: 404 });
        }

        return NextResponse.json({ message: "Workspace deleted successfully." }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
}