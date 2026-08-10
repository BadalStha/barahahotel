import { Container } from "@/components/ui/Container";

export default function BookingLoading() {
  return (
    <Container size="narrow" className="flex flex-col gap-6 py-12">
      <div className="mx-auto flex flex-col items-center gap-3 text-center">
        <div className="h-9 w-56 animate-pulse rounded-full bg-pine/10" />
        <div className="h-4 w-64 animate-pulse rounded-full bg-pine/5" />
      </div>
      <div className="rounded-2xl border border-pine/10 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-16 animate-pulse rounded-xl bg-pine/5" />
          <div className="h-16 animate-pulse rounded-xl bg-pine/5" />
        </div>
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-pine/5" />
        <div className="mt-6 h-11 w-44 animate-pulse rounded-full bg-pine/10" />
      </div>
    </Container>
  );
}
