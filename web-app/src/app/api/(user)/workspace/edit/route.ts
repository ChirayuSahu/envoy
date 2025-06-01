import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import Workspace from "@/models/workspace";
import { getToken } from "next-auth/jwt";

export async function PATCH(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, name, description } = await request.json();

    try {

        await connectMongo();
        const workspace = await Workspace.findOneAndUpdate(
            { _id: workspaceId, owner: userId },
            { name, description },
            { new: true }
        );

        if (!workspace) {
            return NextResponse.json({ message: "Workspace not found or you do not have permission to edit it." }, { status: 404 });
        }

        return NextResponse.json({ message: "Workspace updated successfully.", workspace }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

}