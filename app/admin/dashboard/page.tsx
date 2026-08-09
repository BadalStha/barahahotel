import { BedDouble, BookOpen, Utensils } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { auth } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeading
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name ?? user?.email ?? "admin"} — signed in as ${user?.role ?? "STAFF"}.`}
        align="left"
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { icon: BedDouble, label: "Rooms", value: "—" },
          { icon: BookOpen, label: "Bookings", value: "—" },
          { icon: Utensils, label: "Menu items", value: "—" },
        ].map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-pine/10 text-pine">
              <stat.icon className="size-6" />
            </div>
            <div>
              <p className="text-sm text-charcoal/60">{stat.label}</p>
              <p className="font-display text-2xl text-charcoal">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-pine/25 p-6">
        <p className="text-sm text-charcoal/70">
          Placeholder dashboard — booking, room, and food &amp; beverage
          management panels will live here.
        </p>
      </div>
    </main>
  );
}
