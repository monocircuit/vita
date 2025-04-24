/** @format */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { auth } from "./utilities/pocketbase/auth/auth";

// 1. Specify protected and public routes
const protectedRoutes = ["/home"];
const publicRoutes = ["/login", "/signup", "/"];

export default async function middleware(req: NextRequest) {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

    const token = req.cookies.get("pb_auth")?.value;
    
    if (token) {
        pb.authStore.save(token, null); // Restore auth
    }

    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);
    console.log(pb.authStore.record);
    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !pb.authStore.isValid) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 5. Redirect to /dashboard if the user is authenticated
    if (isPublicRoute && auth.isAuthenticated() && !req.nextUrl.pathname.startsWith("/home")) {
        return NextResponse.redirect(new URL("/home", req.nextUrl));
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
