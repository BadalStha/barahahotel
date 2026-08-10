"use client";

import { SiteError } from "@/components/public/SiteError";

export default function RoomsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SiteError reset={reset} />;
}
