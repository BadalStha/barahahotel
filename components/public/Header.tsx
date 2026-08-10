"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Menu, Mountain, X } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export const PUBLIC_NAV = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Dining", href: "/dining" },
  { label: "Amenities", href: "/amenities" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/** Header nav — the logo already links home, so drop the Home item. */
const HEADER_NAV = PUBLIC_NAV.filter((item) => item.href !== "/");

export function Header({ hotelName }: { hotelName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu when the route changes and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-pine text-stone shadow-[0_10px_30px_-18px_rgba(31,77,58,0.7)]">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Mountain className="size-6 shrink-0 text-saffron" />
          <span className="truncate font-display text-lg tracking-wide">
            {hotelName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {HEADER_NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-white/15 text-white"
                    : "text-stone/80 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/booking"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90"
          >
            <CalendarCheck className="size-4" />
            Book Now
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-lg text-stone/90 transition-colors hover:bg-white/10 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {/* Mobile menu */}
      {open ? (
        <nav className="border-t border-white/10 bg-pine lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {HEADER_NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/15 text-white"
                      : "text-stone/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/booking"
              className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-saffron px-4 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90"
            >
              <CalendarCheck className="size-4" />
              Book Now
            </Link>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
