import { revalidatePath } from "next/cache";

/**
 * Revalidates every public route that reads CMS content, so admin edits
 * appear on the live site immediately instead of waiting for the ISR
 * window. Call this from server actions after mutating site settings,
 * pages, rooms, menu items, gallery, blog, or testimonials.
 */
export function revalidatePublicSite() {
  // The root layout carries the header/footer (site settings).
  revalidatePath("/", "layout");
  for (const path of [
    "/",
    "/rooms",
    "/rooms/[slug]",
    "/about",
    "/gallery",
    "/dining",
    "/blog",
    "/blog/[slug]",
    "/contact",
  ]) {
    revalidatePath(path);
  }
}
