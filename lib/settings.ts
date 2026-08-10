import { db } from "@/lib/db";

/**
 * Site settings are stored as JSON-encoded text values keyed by name —
 * see the seed data in prisma/seed.ts (hotel_name, location, phone, …).
 */

export const TAX_RATE_SETTING_KEY = "invoice_tax_rate";

/** Nepal's standard VAT rate — used when no setting has been configured. */
export const DEFAULT_TAX_RATE = 13;

/** Reads every SiteSetting and returns them parsed from their JSON encoding. */
export async function getSiteSettings(): Promise<Record<string, unknown>> {
  const rows = await db.siteSetting.findMany();
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }
  return settings;
}

/** Read a single setting as a string with a fallback (missing/non-string → fallback). */
export function getSetting(
  settings: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  return typeof settings[key] === "string" ? (settings[key] as string) : fallback;
}

/** The configured invoice tax rate (percent), falling back to the default. */
export async function getTaxRate(): Promise<number> {
  const settings = await getSiteSettings();
  const raw = settings[TAX_RATE_SETTING_KEY];
  const rate = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100
    ? rate
    : DEFAULT_TAX_RATE;
}

/** Persists the invoice tax rate as a SiteSetting (upsert). */
export async function setTaxRate(rate: number): Promise<void> {
  await setSiteSetting(TAX_RATE_SETTING_KEY, rate);
}

/** Upserts a single SiteSetting (value is JSON-encoded automatically). */
export async function setSiteSetting(key: string, value: unknown): Promise<void> {
  await db.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}

/** Upserts many SiteSettings in one transaction. */
export async function setSiteSettings(
  entries: Record<string, unknown>,
): Promise<void> {
  await db.$transaction(
    Object.entries(entries).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      }),
    ),
  );
}
