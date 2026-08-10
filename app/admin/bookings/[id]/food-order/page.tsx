import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AddFoodOrderForm } from "@/components/admin/bookings/AddFoodOrderForm";
import { db } from "@/lib/db";

export default async function AddFoodOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [booking, menuItems] = await Promise.all([
    db.booking.findUnique({
      where: { id },
      include: {
        guest: { select: { fullName: true } },
        room: {
          select: {
            roomNumber: true,
            roomType: { select: { name: true } },
          },
        },
      },
    }),
    db.foodMenuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);
  if (!booking) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          {booking.bookingCode}
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          Add food order
        </h1>
        <p className="mt-1 text-sm text-charcoal/60">
          {booking.guest.fullName} · Room {booking.room.roomNumber} (
          {booking.room.roomType.name})
        </p>
      </div>

      <AddFoodOrderForm
        bookingId={booking.id}
        menuItems={menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          isAvailable: item.isAvailable,
          imageUrl: item.imageUrl,
        }))}
      />
    </div>
  );
}
