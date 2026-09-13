import Link from "next/link";
import { BedDouble, Users } from "lucide-react";

import { formatNPR } from "@/lib/format";
import { CmsImage } from "./CmsImage";

export type RoomCardData = {
  slug: string;
  name: string;
  description: string | null;
  basePrice: number;
  maxOccupancy: number;
  sizeSqft: number | null;
  amenities: string[];
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export function RoomCard({
  room,
  showDescription = false,
}: {
  room: RoomCardData;
  showDescription?: boolean;
}) {
  return (
    <Link
      href={`/rooms/${room.slug}`}
      className="group flex flex-col overflow-hidden border border-pine/15 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative overflow-hidden">
        <CmsImage
          src={room.imageUrl}
          alt={room.imageAlt ?? `${room.name} at Baraha Hotel and Lodge, Bhedetar`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-48 w-full"
          imageClassName="transition-transform duration-500 group-hover:scale-105"
          iconClassName="size-12"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-charcoal">{room.name}</h3>
          <p className="shrink-0 text-right">
            <span className="text-lg font-semibold text-pine">
              {formatNPR(room.basePrice)}
            </span>
            <span className="block text-xs text-charcoal/50">/ night</span>
          </p>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/60">
          <Users className="size-4" />
          Sleeps {room.maxOccupancy}
          {room.sizeSqft ? ` · ${room.sizeSqft} sq ft` : ""}
        </p>
        {showDescription && room.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-charcoal/70">
            {room.description}
          </p>
        ) : null}
        {room.amenities.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="border-l-2 border-saffron pl-2 text-xs text-charcoal/65"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 ? (
              <span className="text-xs text-charcoal/45">
                +{room.amenities.length - 3} more
              </span>
            ) : null}
          </div>
        ) : null}
        <span className="mt-5 inline-flex w-fit items-center gap-1.5 border-b border-pine pb-1 text-sm font-medium text-pine transition-colors group-hover:border-saffron group-hover:text-terracotta">
          <BedDouble className="size-4" />
          View room
        </span>
      </div>
    </Link>
  );
}
