import { Container } from "@/components/ui/Container";
import {
  BookingFlow,
  type BookingFlowInitial,
} from "@/components/public/BookingFlow";
import { socialMetadata } from "@/lib/seo";

export const metadata = {
  ...socialMetadata({
    title: "Book a Stay — Baraha Hotel and Lodge",
    description:
      "Check live availability and book a room at Baraha Hotel and Lodge, Bhedetar, Dhankuta, Nepal.",
    path: "/booking",
  }),
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string): string | undefined =>
    typeof params[key] === "string" ? (params[key] as string) : undefined;

  const initial: BookingFlowInitial = {
    checkIn: get("checkIn"),
    checkOut: get("checkOut"),
    guests: get("guests"),
    roomTypeSlug: get("roomType"),
  };

  return (
    <Container size="narrow">
      <BookingFlow initial={initial} />
    </Container>
  );
}
