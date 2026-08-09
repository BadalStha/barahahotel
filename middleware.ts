import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Run only on admin routes — the `authorized` callback redirects
  // unauthenticated visitors to /admin/login and logged-in users
  // away from /admin/login.
  matcher: ["/admin/:path*"],
};
