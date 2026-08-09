"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validators/auth";

export type LoginActionState = { error?: string };

const DEFAULT_REDIRECT = "/admin/dashboard";

export async function loginAction(
  input: { email: string; password: string },
  redirectTo?: string,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please enter a valid email address and password." };
  }

  // Only allow redirects back into the admin area (avoids open redirects)
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/admin") ? redirectTo : DEFAULT_REDIRECT;

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirect,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
