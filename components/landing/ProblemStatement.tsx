import { AlertTriangle, Ban, FileQuestion } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const PAINS = [
  {
    icon: FileQuestion,
    title: "Traces aren't proof",
    body: "Observability shows what happened — but you still trust the vendor's log. That doesn't hold up in a dispute or audit.",
  },
  {
    icon: Ban,
    title: "Blockers aren't accountability",
    body: "Guardrails can stop bad output. They don't produce evidence your customer, legal team, or regulator can verify independently.",
  },
  {
    icon: AlertTriangle,
    title: "Chat logs don't scale",
    body: "Screenshots and thread exports aren't tamper-evident. When agents publish on your behalf, you need proof — not memory.",
  },
] as const;

export function ProblemStatement() {
  return (
    <section className="border-b border-zinc-200/80 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="The gap"
          title="Traces aren't proof. Blockers aren't accountability."
          description="Teams shipping agent workflows need more than logs — they need verifiable receipts that survive scrutiny."
        />

        <ul className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-3 sm:gap-8">
          {PAINS.map((pain) => {
            const Icon = pain.icon;
            return (
              <li
                key={pain.title}
                className="tr-card list-none p-5 sm:p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-zinc-950">
                  {pain.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{pain.body}</p>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
          LangSmith tells you what happened. Guardrails stop bad things.{" "}
          <span className="font-medium text-zinc-800">
            Trust Receipt proves what happened — and that it was allowed.
          </span>
        </p>
      </div>
    </section>
  );
}
