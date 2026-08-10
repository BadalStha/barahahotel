"use client";

import { AdminError } from "@/components/admin/AdminError";

export default function AdminErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminError reset={reset} />;
}
