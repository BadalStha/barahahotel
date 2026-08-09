import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Valid bcrypt hash of a random string — used when the email is unknown so
// the bcrypt compare always runs and response time doesn't reveal whether
// an account exists (user-enumeration timing).
const DUMMY_PASSWORD_HASH =
  "$2b$10$gAqMGEnWmW7xLRSUu4NRnuRR5JTmAs7HHRJoXUfkSZ6MOZQl4GD22";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Admin credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const admin = await db.adminUser.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Always run bcrypt (against a dummy hash when the email is unknown)
        // to equalize timing between existing and non-existing accounts.
        const passwordValid = await bcrypt.compare(
          password,
          admin?.passwordHash ?? DUMMY_PASSWORD_HASH,
        );
        if (!admin || !passwordValid) return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
});
