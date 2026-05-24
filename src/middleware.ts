import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Logged-in users should not see the login page
    if (token && pathname.startsWith("/admin/login")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        if (path === "/admin/login" || path.startsWith("/admin/login/")) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
