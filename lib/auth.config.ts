import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

/**
 * Edge-safe Auth.js config, shared by the root middleware and the full
 * setup in lib/auth.ts. Must NOT import Prisma, bcrypt, or any other
 * Node-only module — this file is bundled into the edge runtime.
 *
 * Providers are attached in lib/auth.ts so the database-backed
 * Credentials `authorize` never reaches the middleware bundle.
 */
export const authConfig = {
  // Providers are added in lib/auth.ts (they need Prisma + bcrypt, which
  // must not be bundled into the edge middleware).
  providers: [],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname === "/admin/login";

      // Signed-in users visiting the login page go straight to the dashboard
      if (isOnLogin) {
        if (isLoggedIn) {
          return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
        }
        return true;
      }

      // Everything else under /admin requires a session
      if (isOnAdmin) return isLoggedIn;

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role ?? "STAFF") as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
