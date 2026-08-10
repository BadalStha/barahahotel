/**
 * Shared public navigation links.
 *
 * Kept in its own plain module (no `"use client"`) so that both the client
 * Header and the server-rendered Footer can import it. Importing a non-component
 * export like this from a `"use client"` module makes it `undefined` on the
 * server (RSC boundary), which breaks `PUBLIC_NAV.map(...)` at render time.
 */
export const PUBLIC_NAV = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Dining", href: "/dining" },
  { label: "Amenities", href: "/amenities" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
