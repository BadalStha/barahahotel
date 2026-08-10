import type { Metadata } from "next";

/**
 * Technical-SEO helpers shared by every public route: canonical URLs,
 * Open Graph / Twitter metadata, JSON-LD builders, and image helpers.
 */

const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://barahahotel.com";
export const SITE_URL = envUrl.replace(/\/+$/, "");

/** Absolute site URL for a path (e.g. "/rooms/deluxe"). */
export function url(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Turns a CMS image path into an absolute URL (for OG tags / schema) and
 * applies Cloudinary f_auto/q_auto so social + schema images are optimized
 * the same way on-page photos are.
 */
export function absoluteImage(src?: string | null): string | undefined {
  if (!src) return undefined;
  // `src` is non-empty here, so the optimizer always returns a string.
  const optimized = optimizeCloudinaryUrl(src) ?? src;
  return /^https?:\/\//.test(optimized) ? optimized : url(optimized);
}

/**
 * Appends Cloudinary's automatic format + quality ("f_auto,q_auto") to
 * Cloudinary URLs so CMS photos are served as optimally compressed
 * WebP/AVIF instead of the original JPEG/PNG bytes.
 */
export function optimizeCloudinaryUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (!src.includes("res.cloudinary.com")) return src;
  if (src.includes("f_auto") || src.includes("q_auto")) return src;
  return src.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
}

export type SocialMetadataInput = {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
};

/** Canonical URL + Open Graph + Twitter card metadata for a public route. */
export function socialMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: SocialMetadataInput): Metadata {
  const ogImage = absoluteImage(image);
  return {
    alternates: { canonical: url(path) },
    openGraph: {
      title,
      description,
      url: url(path),
      type,
      siteName: "Baraha Hotel and Lodge",
      locale: "en_US",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/** BreadcrumbList JSON-LD for nested pages. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: url(item.path),
    })),
  };
}
