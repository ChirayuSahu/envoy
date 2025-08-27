import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/utils/connectMongo";
import { generalLimiter, getUserIP } from "@/utils/limiter";
import { getToken } from "next-auth/jwt";
import User from "@/models/user";

export async function GET(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const ip = getUserIP(request);
        await generalLimiter.consume(ip);
    } catch (error) {
        return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }
    
    try {
        await connectMongo();
        const user = await User.findById(userId).select("-password -__v");
        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });

    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
    }
}