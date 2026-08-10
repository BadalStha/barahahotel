import Link from "next/link";
import { CalendarCheck, Mountain } from "lucide-react";

import { Container } from "@/components/ui/Container";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Book a stay", href: "/booking" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-stone text-charcoal">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-pine text-stone">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Mountain className="size-6 text-saffron" />
            <span className="font-display text-lg tracking-wide">
              Baraha Hotel <span className="text-saffron">&amp;</span> Lodge
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-stone/80 transition-colors hover:bg-white/10 hover:text-white sm:px-4"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="ml-1 hidden items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-saffron/90 sm:inline-flex"
            >
              <CalendarCheck className="size-4" />
              Reserve
            </Link>
          </nav>
        </Container>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-pine/10 bg-pine text-stone">
        <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Mountain className="size-5 text-saffron" />
              <p className="font-display text-base">Baraha Hotel and Lodge</p>
            </div>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone/70">
              A Himalayan hill-station retreat in Bhedetar, Dhankuta, Nepal —
              quiet rooms, mountain views, and home-style food.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-stone/80">
            <Link href="/rooms" className="transition-colors hover:text-white">
              Our rooms
            </Link>
            <Link
              href="/booking"
              className="transition-colors hover:text-white"
            >
              Book a stay
            </Link>
            <Link
              href="/admin/login"
              className="text-stone/50 transition-colors hover:text-stone/80"
            >
              Admin
            </Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
