import { NextResponse } from "next/server";

import { pruneArchivedStays } from "@/lib/archive";

/**
 * Vercel Cron entry point for pruning archived stays from Postgres.
 * Protect with CRON_SECRET (Authorization: Bearer <secret>).
 * Only deletes stays that were successfully archived to Google Sheets.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pruned = await pruneArchivedStays();
  return NextResponse.json({ pruned });
}
