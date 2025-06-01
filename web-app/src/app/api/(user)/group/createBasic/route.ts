import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import BasicGroup from "@/models/basicGroup";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
 
    const { envs, expireAt } = await request.json();

    if (!envs || !expireAt) {
        return NextResponse.json({ error: "Envs and expireAt are required." }, { status: 400 });
    }

    if (!Array.isArray(envs) || envs.length === 0) {
        return NextResponse.json({ error: "Envs must be a non-empty array." }, { status: 400 });
    }
    
    if (typeof expireAt !== 'number' || expireAt <= 0) {
        return NextResponse.json({ error: "ExpireAt must be a positive number." }, { status: 400 });
    }

    try {

        await connectMongo();

        let uuid = randomUUID();

        if(await BasicGroup.exists({ token: uuid })) {
            uuid = randomUUID();
        }

        const basicGroup = await BasicGroup.create({
            token: uuid,
            envs,
            expireAt: new Date(Date.now() + expireAt * 1000), // expireAt in seconds
        });

        return NextResponse.json({ message:"Group Created Successfully.", token: basicGroup.token }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}