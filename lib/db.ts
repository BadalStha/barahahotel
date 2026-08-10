import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Appends generous connection timeouts to the DATABASE_URL.
 *
 * Neon's free-tier compute auto-suspends after ~5 minutes idle and can take
 * 60s+ to wake on the next connection. Prisma's defaults (connect_timeout 5s,
 * pool_timeout 10s) give up before the wake finishes, causing 500s on the
 * public site. Adding these params lets wake-on-connect complete. We do this
 * in code (not just .env) because the URL can also come from a pre-existing
 * OS/Vercel environment variable, which takes precedence over .env files.
 */
function withColdStartTimeouts(url: string): string {
  const has = (param: string) => new URL(url).searchParams.has(param);
  if (has("connect_timeout") && has("pool_timeout")) return url;
  const extra = [
    has("connect_timeout") ? "" : "connect_timeout=90",
    has("pool_timeout") ? "" : "pool_timeout=90",
  ]
    .filter(Boolean)
    .join("&");
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${extra}`;
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  return new PrismaClient({
    ...(url ? { datasources: { db: { url: withColdStartTimeouts(url) } } } : {}),
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
