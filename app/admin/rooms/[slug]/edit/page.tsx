import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { RoomTypeForm } from "@/components/admin/rooms/RoomTypeForm";
import { db } from "@/lib/db";

export default async function EditRoomTypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roomType = await db.roomType.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!roomType) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href={`/admin/rooms/${roomType.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors hover:text-pine"
        >
          <ArrowLeft className="size-4" />
          {roomType.name}
        </Link>
        <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">
          Edit room type
        </h1>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-8">
        <RoomTypeForm
          roomType={{
            slug: roomType.slug,
            name: roomType.name,
            description: roomType.description,
            basePrice: roomType.basePrice.toString(),
            maxOccupancy: roomType.maxOccupancy,
            sizeSqft: roomType.sizeSqft,
            amenities: roomType.amenities,
            isActive: roomType.isActive,
            images: roomType.images.map((img) => ({
              url: img.url,
              altText: img.altText,
            })),
          }}
        />
      </div>
    </div>
  );
}
