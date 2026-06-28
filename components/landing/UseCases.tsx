import { Building2, Rocket, Shield } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const USE_CASES = [
  {
    icon: Building2,
    title: "Compliance & legal",
    quote:
      "When regulators ask how an AI-generated claim reached customers, I need a signed artifact — not a Slack thread.",
    role: "Head of Compliance, fintech",
    outcome: "Audit-ready agent runs with offline-verifiable receipts.",
  },
  {
    icon: Rocket,
    title: "GTM & content",
    quote:
      "Our team ships dozens of agent-drafted posts a week. I want policy checks and proof attached before anything goes live.",
    role: "VP Marketing, B2B SaaS",
    outcome: "Publish with confidence — or route to human review with context.",
  },
  {
    icon: Shield,
    title: "Platform & security",
    quote:
      "We already have LangChain and internal tools. We needed a trust layer that proves what ran without calling home to verify.",
    role: "Staff engineer, platform team",
    outcome: "Sits beside your stack; verify receipts with Web Crypto locally.",
  },
] as const;

export function UseCases() {
  return (
    <section id="use-cases" className="border-b border-zinc-200/80 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Who it's for"
          title="Built for the people who answer when agents act"
          description="Representative scenarios from teams evaluating runtime trust — not vanity logos."
        />

        <ul className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-3 lg:gap-8">
          {USE_CASES.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="tr-card flex list-none flex-col p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-zinc-100 ring-1 ring-zinc-200/80">
                    <Icon className="h-5 w-5 text-blue-700" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-950">{item.title}</h3>
                </div>
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-zinc-700">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <footer className="mt-4 border-t border-zinc-100 pt-4">
                  <p className="text-xs font-medium text-zinc-500">{item.role}</p>
                  <p className="mt-2 text-sm text-emerald-800">{item.outcome}</p>
                </footer>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
