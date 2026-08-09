import {
  BedDouble,
  Coffee,
  Leaf,
  Mountain,
  MountainSnow,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import {
  MountainDivider,
  SectionHeading,
} from "@/components/ui/SectionHeading";

const palette = [
  {
    name: "Pine",
    hex: "#1F4D3A",
    cls: "bg-pine",
    label: "text-white/85",
    role: "Primary · forest green",
  },
  {
    name: "Terracotta",
    hex: "#B5502C",
    cls: "bg-terracotta",
    label: "text-white/85",
    role: "Secondary / accent",
  },
  {
    name: "Saffron",
    hex: "#E1A93A",
    cls: "bg-saffron",
    label: "text-charcoal/80",
    role: "Highlight / CTA",
  },
  {
    name: "Stone",
    hex: "#F6F1E9",
    cls: "bg-stone",
    label: "text-charcoal/80",
    role: "Background",
  },
  {
    name: "Charcoal",
    hex: "#2B2620",
    cls: "bg-charcoal",
    label: "text-white/85",
    role: "Text",
  },
  {
    name: "Mist",
    hex: "#E8ECE9",
    cls: "bg-mist",
    label: "text-charcoal/80",
    role: "Light overlay",
  },
];

const headingScale = [
  { tag: "H1 · 5xl", cls: "font-display text-5xl", text: "A Room Above the Clouds" },
  { tag: "H2 · 4xl", cls: "font-display text-4xl", text: "Trek, Rest, Repeat" },
  { tag: "H3 · 3xl", cls: "font-display text-3xl", text: "The Dining Room" },
  { tag: "H4 · 2xl", cls: "font-display text-2xl", text: "Our Story" },
];

const cardDemos = [
  {
    icon: Mountain,
    title: "Mountain View Rooms",
    text: "Wake to ridgelines and mist rolling up the valley — every room faces the peaks.",
    cta: "View rooms",
  },
  {
    icon: Coffee,
    title: "The Carved Terrace",
    text: "Buffalo curd, millet chhaang, and coffee brewed slowly over open coals.",
    cta: "Dine with us",
  },
  {
    icon: Leaf,
    title: "Guided Trails",
    text: "Local guides lead loops through rhododendron forests to hidden mountain stupas.",
    cta: "Plan a trek",
  },
];

export default function StyleGuidePage() {
  return (
    <main className="min-h-screen bg-stone text-charcoal">
      {/* tri-color accent strip */}
      <div className="h-1.5 bg-gradient-to-r from-pine via-saffron to-terracotta" />

      <Container className="flex flex-col gap-24 py-16 sm:py-24">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex flex-col items-center gap-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
            Baraha Hotel · Design System
          </p>
          <h1 className="font-display text-5xl leading-tight sm:text-6xl">
            Style Guide
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-charcoal/70">
            A Nepali Himalayan hill-station aesthetic — pine forests,
            terracotta roofs, and saffron dawns. This page documents the
            palette, type, and UI primitives that will shape every page of the
            hotel website.
          </p>
          <MountainDivider />
        </header>

        {/* ── Palette ────────────────────────────────────────── */}
        <section className="flex flex-col gap-8">
          <SectionHeading
            title="Palette"
            subtitle="Defined as CSS custom properties in :root and exposed to Tailwind through the @theme extension."
            align="left"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {palette.map((c) => (
              <div
                key={c.name}
                className="overflow-hidden rounded-xl border border-charcoal/10 bg-white/60 shadow-sm transition-transform duration-200 hover:-translate-y-1"
              >
                <div className={`${c.cls} flex h-24 items-end p-3`}>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${c.label}`}
                  >
                    {c.name}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-mono text-xs font-medium">{c.hex}</p>
                  <p className="font-mono text-[11px] text-charcoal/50">{c.cls}</p>
                  <p className="mt-1.5 text-xs leading-snug text-charcoal/70">
                    {c.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography ─────────────────────────────────────── */}
        <section className="flex flex-col gap-8">
          <SectionHeading
            title="Typography"
            subtitle="Rozha One for display and headings, Inter for body text — both self-hosted via next/font."
            align="left"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl">Rozha One</h3>
                <span className="rounded-full bg-mist px-3 py-1 font-mono text-xs text-charcoal/70">
                  --font-rozha
                </span>
              </div>
              <p className="font-display text-4xl leading-snug sm:text-5xl">
                Nepal&apos;s Mountain Hospitality
              </p>
              <p className="font-display text-3xl text-pine">
                बराहा होटल · नमस्ते
              </p>
              <p className="text-sm text-charcoal/60">
                Display &amp; headings — supports Devanagari and Latin.
              </p>
            </Card>
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl">Inter</h3>
                <span className="rounded-full bg-mist px-3 py-1 font-mono text-xs text-charcoal/70">
                  --font-inter
                </span>
              </div>
              <p className="text-lg leading-relaxed">
                Perched at two thousand metres above the valley floor, Baraha
                Hotel looks out across terraced hillsides and, on clear
                mornings, the full Annapurna range.
              </p>
              <p className="font-mono text-sm text-charcoal/60">
                Body text — set once on the root layout, inherited everywhere.
              </p>
            </Card>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
            {headingScale.map((h) => (
              <div
                key={h.tag}
                className="flex flex-col gap-1 border-b border-charcoal/5 pb-4 last:border-0 last:pb-0"
              >
                <span className="font-mono text-[11px] uppercase tracking-wider text-terracotta">
                  {h.tag}
                </span>
                <p className={h.cls}>{h.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Buttons ────────────────────────────────────────── */}
        <section className="flex flex-col gap-8">
          <SectionHeading
            title="Buttons"
            subtitle="Rounded, warm, and tactile — saffron focus rings, a soft press, and hover states tuned to each variant."
            align="left"
          />
          <div className="flex flex-col gap-6">
            {(["sm", "md", "lg"] as const).map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-4">
                <span className="w-8 font-mono text-xs text-charcoal/50">
                  {size}
                </span>
                <Button variant="primary" size={size}>
                  Primary
                </Button>
                <Button variant="secondary" size={size}>
                  Secondary
                </Button>
                <Button variant="outline" size={size}>
                  Outline
                </Button>
                <Button variant="primary" size={size} disabled>
                  Disabled
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-4">
              <span className="w-8 font-mono text-xs text-charcoal/50">
                icon
              </span>
              <Button variant="primary">
                <MountainSnow className="size-5" /> Book a Stay
              </Button>
              <Button variant="secondary">
                <BedDouble className="size-5" /> View Rooms
              </Button>
              <Button variant="outline">
                <Leaf className="size-5" /> Explore
              </Button>
            </div>
          </div>
        </section>

        {/* ── Cards ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-8">
          <SectionHeading
            title="Cards"
            subtitle="Wood-carved frames — a subtle pine border, an inset groove, rounded corners, and a soft shadow."
            align="left"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {cardDemos.map((c) => (
              <Card
                key={c.title}
                className="group flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-pine/10 text-pine transition-colors duration-200 group-hover:bg-pine group-hover:text-stone">
                  <c.icon className="size-6" />
                </div>
                <h3 className="font-display text-2xl">{c.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-charcoal/70">
                  {c.text}
                </p>
                <Button variant="outline" size="sm" className="self-start">
                  {c.cta} →
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Section headings ───────────────────────────────── */}
        <section className="flex flex-col gap-10">
          <SectionHeading
            title="Section Headings"
            subtitle="Centered and left-aligned variants, each crowned by the thin mountain-silhouette divider."
          />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-charcoal/25 p-8">
              <SectionHeading
                title="Centered"
                subtitle="Subtitle sits below the title, above the divider."
              />
            </div>
            <div className="rounded-2xl border border-dashed border-charcoal/25 p-8">
              <SectionHeading
                title="Left Aligned"
                subtitle="Left variants align title and divider to the start edge."
                align="left"
              />
            </div>
          </div>
        </section>

        {/* ── Container ──────────────────────────────────────── */}
        <section className="flex flex-col gap-8">
          <SectionHeading
            title="Container"
            subtitle="The max-width wrapper used across every page — centered, fluid, and padded."
            align="left"
          />
          <div className="rounded-2xl border border-dashed border-charcoal/25 p-2">
            <Container>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-pine px-6 py-4 text-stone">
                <span className="font-mono text-xs sm:text-sm">
                  max-w-6xl · mx-auto · px-4 sm:px-6 lg:px-8
                </span>
                <span className="rounded-full bg-saffron px-3 py-1 text-xs font-semibold text-charcoal">
                  Container
                </span>
              </div>
            </Container>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="flex flex-col items-center gap-4 border-t border-charcoal/10 pt-10 text-center">
          <MountainDivider className="text-terracotta" />
          <p className="text-sm text-charcoal/60">
            Baraha Hotel · नमस्ते from the hills
          </p>
          <Button variant="secondary" size="sm">
            <Sun className="size-4" /> Good morning, Annapurna
          </Button>
        </footer>
      </Container>
    </main>
  );
}
