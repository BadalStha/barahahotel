import { ImageResponse } from "next/og";

import { db } from "@/lib/db";
import { formatNPR } from "@/lib/format";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Generated on demand so room photo/price edits appear immediately and the
// route never queries the database at build time.
export const dynamic = "force-dynamic";

/** Fetches an image and returns it as a base64 data URL (avoids hotlinking
 * remote URLs from the ImageResponse renderer). Returns null on failure. */
async function loadImage(src?: string | null): Promise<string | null> {
  if (!src) return null;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const type = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function RoomOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roomType = await db.roomType.findUnique({
    where: { slug },
    select: {
      name: true,
      basePrice: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  const name = roomType?.name ?? "Room";
  const photo = await loadImage(roomType?.images[0]?.url);
  const price = roomType ? formatNPR(Number(roomType.basePrice)) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1f4d3a",
        }}
      >
        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {photo ? (
            <img
              src={photo}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, #1f4d3a 0%, #2f6b52 55%, #1a4434 100%)",
              }}
            />
          )}
          {/* pine scrim for legibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(31,77,58,0.94) 0%, rgba(31,77,58,0.45) 55%, rgba(31,77,58,0.15) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 56,
              right: 56,
              bottom: 48,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 20,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#e1a93a",
                fontWeight: 600,
              }}
            >
              Baraha Hotel and Lodge · Bhedetar
            </div>
            <div
              style={{
                fontSize: 64,
                color: "#f6f1e9",
                fontWeight: 700,
              }}
            >
              {name}
            </div>
            {price ? (
              <div style={{ fontSize: 30, color: "#f6f1e9", opacity: 0.9 }}>
                {price} / night
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
