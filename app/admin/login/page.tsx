import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { auth } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) redirect("/admin/dashboard");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-stone px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
