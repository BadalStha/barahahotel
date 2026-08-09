import { AdminShell } from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Logged-out visitors (e.g. /admin/login) get a bare shell — no sidebar,
  // no admin chrome. Everything else renders inside the sidebar layout.
  if (!session?.user) {
    return <div className="min-h-screen bg-stone">{children}</div>;
  }

  return (
    <AdminShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        role: session.user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
