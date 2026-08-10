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
      className="group flex flex-col overflow-hidden rounded-2xl border border-pine/15 bg-white shadow-[0_14px_32px_-16px_rgba(43,38,32,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-16px_rgba(31,77,58,0.4)]"
    >
      <div className="relative overflow-hidden">
        <CmsImage
          src={room.imageUrl}
          alt={room.imageAlt ?? room.name}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                className="rounded-full bg-pine/10 px-2.5 py-0.5 text-xs font-medium text-pine"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 ? (
              <span className="rounded-full bg-stone px-2.5 py-0.5 text-xs text-charcoal/50">
                +{room.amenities.length - 3} more
              </span>
            ) : null}
          </div>
        ) : null}
        <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-pine px-4 py-2 text-sm font-medium text-stone transition-colors group-hover:bg-pine/90">
          <BedDouble className="size-4" />
          View room
        </span>
      </div>
    </Link>
  );
}
