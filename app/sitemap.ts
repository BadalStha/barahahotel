import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

// Generated per request (force-dynamic): the DB may be updated between
// deployments, and this avoids a build-time database dependency.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  const [rooms, posts] = await Promise.all([
    db.roomType.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/` },
    { url: `${base}/rooms` },
    { url: `${base}/about` },
    { url: `${base}/gallery` },
    { url: `${base}/dining` },
    { url: `${base}/blog` },
    { url: `${base}/contact` },
    { url: `${base}/booking` },
  ];

  const roomRoutes: MetadataRoute.Sitemap = rooms.map((room) => ({
    url: `${base}/rooms/${room.slug}`,
    lastModified: room.updatedAt,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticRoutes, ...roomRoutes, ...postRoutes];
}
