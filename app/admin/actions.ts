"use server";

import { signOut } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";

export async function signOutAction() {
  await requireAdmin();
  await signOut({ redirectTo: "/admin/login" });
}
