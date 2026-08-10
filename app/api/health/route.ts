import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Health check — also doubles as a Neon "keep alive / wake on demand" ping:
 * hitting this endpoint forces a DB connection, which wakes an auto-suspended
 * Neon compute. Useful for uptime monitors (UptimeRobot, Vercel Cron, etc.).
 */
export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up", ms: Date.now() - started });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        ms: Date.now() - started,
        error: error instanceof Error ? error.message.split("\n")[0] : "unknown",
      },
      { status: 503 },
    );
  }
}
