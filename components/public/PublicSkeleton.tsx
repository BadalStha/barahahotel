import { Container } from "@/components/ui/Container";

/** Generic public loading skeleton (rooms cards, content blocks, etc.). */
export function PublicSkeleton() {
  return (
    <Container
      className="flex flex-col gap-6 py-16"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="mx-auto flex flex-col items-center gap-3">
        <div className="h-10 w-56 animate-pulse rounded-full bg-pine/10" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-pine/5" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-pine/10 bg-white"
          >
            <div className="h-44 animate-pulse bg-pine/10" />
            <div className="flex flex-col gap-3 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-pine/10" />
              <div className="h-3 w-full animate-pulse rounded-full bg-pine/5" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-pine/5" />
              <div className="mt-2 h-9 w-28 animate-pulse rounded-full bg-pine/10" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
