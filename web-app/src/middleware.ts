import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.redirect(new URL('/api/auth/signin', request.url)) //change the URL to your login page after frontend is ready
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/dash/:path*',
}