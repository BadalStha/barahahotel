"use client";

import { SiteError } from "@/components/public/SiteError";

/**
 * Root error boundary — catches errors thrown in the layouts themselves
 * (e.g. the public layout's settings fetch or the admin layout's auth()
 * when the database is unreachable), which segment-level error.tsx files
 * cannot catch.
 */
export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-stone">
      <SiteError reset={reset} />
    </div>
  );
}
