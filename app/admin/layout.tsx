import Link from "next/link";
import { Mountain } from "lucide-react";

import { auth } from "@/lib/auth";
import { signOutAction } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-stone">
      <header className="border-b border-pine/20 bg-pine text-stone">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <Mountain className="size-6 text-saffron" />
            <span className="font-display text-xl tracking-wide">
              Baraha Admin
            </span>
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">
                  {session.user.name ?? session.user.email}
                </p>
                <p className="text-xs text-stone/70">{session.user.email}</p>
              </div>
              <span className="rounded-full bg-saffron px-2.5 py-0.5 text-xs font-semibold text-charcoal">
                {session.user.role}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="h-9 cursor-pointer rounded-full border border-stone/40 px-4 text-sm font-medium text-stone transition-colors hover:bg-stone/10"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
