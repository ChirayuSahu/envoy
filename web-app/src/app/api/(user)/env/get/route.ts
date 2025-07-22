import connectMongo from "@/utils/connectMongo";
import Group from "@/models/group";
import BasicGroup from "@/models/basicGroup";
import { NextRequest, NextResponse } from "next/server";
import { generalLimiter } from "@/utils/limiter";
import { getUserIP } from "@/utils/limiter";

export async function GET(request: NextRequest) {

    const token = request.headers.get("Authorization")?.split(" ")[1];
    const userIP = await getUserIP(request);

    if (!token) {
        return NextResponse.json({ message: "Group Token not provided." }, { status: 401 });
    }

    try {
        await generalLimiter.consume(userIP);
    } catch (error) {
        return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

    try {

        await connectMongo();

        const group = await Group.findOne({ token }) || await BasicGroup.findOne({ token });

        if (!group) {
            return NextResponse.json({ message: "Group not found." }, { status: 404 });
        }

        return NextResponse.json({ group })

    } catch (error: any) {
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }

}