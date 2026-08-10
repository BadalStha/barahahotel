import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { MountainDivider } from "@/components/ui/SectionHeading";

export function PageHero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-pine/10 bg-pine/5 py-14 sm:py-20">
      <Container className="flex flex-col items-center text-center">
        <h1 className="max-w-3xl font-display text-4xl leading-tight text-charcoal sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-charcoal/70">{subtitle}</p>
        ) : null}
        <MountainDivider className="mt-4" />
        {children}
      </Container>
    </section>
  );
}
