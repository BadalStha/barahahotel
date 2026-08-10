import Link from "next/link";
import { FileText, Settings } from "lucide-react";

const SECTIONS = [
  {
    title: "Site settings",
    description:
      "Hotel name, tagline, contact details, social links, hours, tax rate, and homepage hero.",
    href: "/admin/content/settings",
    icon: Settings,
  },
  {
    title: "Pages",
    description:
      "Edit About and other page content — title, meta fields, and structured body blocks.",
    href: "/admin/content/pages",
    icon: FileText,
  },
];

export default function AdminContentHubPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl text-charcoal sm:text-3xl">Content</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Manage everything your guests see — no code required.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-charcoal/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-md"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-pine/10 text-pine">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-3 font-display text-lg text-charcoal">{title}</h2>
            <p className="mt-1 text-sm text-charcoal/60">{description}</p>
            <p className="mt-3 text-sm font-medium text-pine opacity-0 transition-opacity group-hover:opacity-100">
              Open →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
