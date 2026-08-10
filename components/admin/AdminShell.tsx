"use client";

import type { Role } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BedDouble,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Menu,
  Mountain,
  Newspaper,
  Settings,
  Star,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";

import { signOutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

type AdminUser = {
  name: string | null;
  email: string | null;
  role: Role;
};

const NAV_SECTIONS: {
  label: string;
  items: { label: string; href: string; icon: LucideIcon }[];
}[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
      { label: "Rooms", href: "/admin/rooms", icon: BedDouble },
      { label: "Food Menu", href: "/admin/food-menu", icon: Utensils },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Content (CMS)", href: "/admin/content", icon: FileText },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "Testimonials", href: "/admin/testimonials", icon: Star },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/admin/content/settings", icon: Settings }],
  },
];

function Brand() {
  return (
    <Link
      href="/admin/dashboard"
      className="flex shrink-0 items-center gap-2.5 border-b border-white/10 px-5 py-4"
    >
      <Mountain className="size-6 text-saffron" />
      <span className="font-display text-lg tracking-wide text-stone">
        Baraha Admin
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-5">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone/40">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-stone/70 hover:bg-white/5 hover:text-stone",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer with Escape and lock body scroll while it's open
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-stone">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-pine lg:flex print:hidden">
        <Brand />
        <NavList />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          id="admin-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          className="fixed inset-0 z-40 lg:hidden"
        >
          <div
            className="absolute inset-0 bg-charcoal/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-pine shadow-xl print:hidden">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="mr-3 rounded-lg p-2 text-stone/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-charcoal/10 bg-white px-4 sm:px-6 print:hidden">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="admin-drawer"
            onClick={() => setMobileOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg text-charcoal/70 transition-colors hover:bg-charcoal/5 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight text-charcoal">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-charcoal/50">{user.email}</p>
            </div>
            <span className="rounded-full bg-saffron px-2.5 py-0.5 text-xs font-semibold text-charcoal">
              {user.role}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="h-9 cursor-pointer rounded-lg border border-charcoal/15 px-4 text-sm font-medium text-charcoal/80 transition-colors hover:bg-charcoal/5"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
