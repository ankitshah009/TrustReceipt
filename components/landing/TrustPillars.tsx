type TrustPillar = {
  title: string;
  description: string;
};

const TRUST_PILLARS: TrustPillar[] = [
  {
    title: "Identity",
    description:
      "Every agent and service in the run is named, authenticated, and traceable from the first step to the last.",
  },
  {
    title: "Authority",
    description:
      "Actions stay within granted scope and permissions. Escalations and out-of-band requests are flagged before they propagate.",
  },
  {
    title: "Intent alignment",
    description:
      "Outputs are measured against the original brief — not just the last prompt in the chain.",
  },
  {
    title: "Policy compliance",
    description:
      "Brand, regulatory, and safety rules are evaluated at runtime. Nothing ships until required policies pass.",
  },
  {
    title: "Source grounding",
    description:
      "Claims link back to sources with a complete audit trail. Unsupported assertions fail the check.",
  },
];

export function TrustPillars() {
  return (
    <section id="security" className="border-b border-zinc-200/80 bg-white py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-[-0.01em] text-zinc-500">
            Verification
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
            Five checks, one coherent verdict
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-600">
            Each dimension is scored independently, then rolled into a single
            signed receipt your team can audit.
          </p>
        </header>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5 lg:gap-8">
          {TRUST_PILLARS.map((pillar, index) => (
            <article key={pillar.title} className="min-w-0">
              <span
                className="font-mono text-xs tabular-nums text-zinc-400"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-base font-semibold tracking-[-0.02em] text-zinc-950">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
