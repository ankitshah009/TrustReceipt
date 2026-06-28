"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { SectionHeader } from "./SectionHeader";

const FAQ_ITEMS = [
  {
    q: "Do I need an API key to try the demo?",
    a: "Yes — live agent steps call Grok via server-side actions. Set GROK_API_KEY or XAI_API_KEY in .env.local for local dev, or use the hosted deployment where keys are configured securely. Sample briefs are included so you can start quickly.",
  },
  {
    q: "Does verification call your servers?",
    a: "No. Receipt signing and integrity checks use the Web Crypto API in your browser (ECDSA P-256). Download the JSON and verify offline — no callback required.",
  },
  {
    q: "What happens when policy fails?",
    a: "The Observer Agent flags violations, can block publication, and the workflow still completes so you see the full output and signed receipt — including intervention count and human-review status.",
  },
  {
    q: "How is this different from LangSmith or guardrails?",
    a: "Traces show history; guardrails block bad output. Trust Receipt produces a tamper-evident, signed artifact that proves what ran and whether it was allowed — for auditors and customers, not just engineers.",
  },
  {
    q: "Is there rate limiting on the public demo?",
    a: "Yes. Production deployments enforce per-IP limits on LLM workflow calls to prevent abuse and control cost. If you hit the limit, wait and retry or contact us for higher quotas.",
  },
  {
    q: "Pricing and early access?",
    a: "We're in early access — run the demo, share your use case via the contact link, and we'll reach out about pilot programs for teams with compliance or high-volume agent workflows.",
  },
] as const;

function FaqItem({ question, answer, open, onToggle }: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border-b border-zinc-200 last:border-b-0">
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-4 py-4 text-left text-sm font-medium text-zinc-900 sm:text-[15px]"
        onClick={onToggle}
      >
        {question}
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} role="region" aria-labelledby={buttonId} className="pb-4 pr-8">
          <p className="text-sm leading-relaxed text-zinc-600">{answer}</p>
        </div>
      ) : null}
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section id="faq" className="border-b border-zinc-200/80 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="FAQ"
          title="Common questions"
          description="Straight answers for teams evaluating runtime trust."
        />
        <div className="mx-auto mt-10 max-w-2xl sm:mt-14">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.q}
              question={item.q}
              answer={item.a}
              open={openIndex === index}
              onToggle={() => toggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
