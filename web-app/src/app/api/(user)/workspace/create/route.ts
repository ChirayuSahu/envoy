import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
//import { getServerSession } from "next-auth"; add this after API testing is done
import Workspace from "@/modals/workspace";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
    
    // add session check after API testing is done
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    const userId = token?.id;

    const { name, description } = await request.json();

    if(!name || !description) {
        return NextResponse.json({ error: "Name and description are required." }, { status: 400 });
    }

    try {

        await connectMongo();

        const workspace = await Workspace.create({ name, description, owner: userId });

        return NextResponse.json({ message: "Workspace created successfully", workspace }, { status: 201 });

    } catch (error: any){
        return NextResponse.json({ error: error.message }, { status: 500 });
    }




}