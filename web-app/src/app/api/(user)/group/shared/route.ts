import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/connectMongo";
import User from "@/models/user";
import Group from "@/models/group";
import { getToken } from "next-auth/jwt";
import { generalLimiter, getUserIP } from "@/utils/limiter";

export async function GET(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const ip = getUserIP(request);
        await generalLimiter.consume(ip);
    } catch (error) {
        return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    } 

    try {
        await connectMongo();
        const user = await User.findById(userId).populate('otherGroups');

        return NextResponse.json({ message: "Shared groups fetched successfully.", otherGroups: user?.otherGroups }, { status: 200 });
    } catch (error: any) {
        console.log("Error fetching shared groups:", error);
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }
}