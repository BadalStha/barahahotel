import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) {
    redirect("/admin/login");
  }
  return session;
}
