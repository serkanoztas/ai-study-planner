// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; 

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Giriş yapmış kullanıcılar login veya ana sayfaya (Landing Page) giderse Dashboard'a yönlendir
    if (isLoggedIn && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Giriş yapmamış kullanıcılar korumalı sayfalara gitmeye çalışırsa Login'e yönlendir
    if (!isLoggedIn && (pathname.startsWith("/dashboard") || pathname.startsWith("/calendar") || pathname.startsWith("/coach") || pathname.startsWith("/analytics"))) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
});

// Middleware'in hangi sayfalarda çalışacağını belirliyoruz (Gereksiz yere görsellerde vs. çalışmasın)
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};