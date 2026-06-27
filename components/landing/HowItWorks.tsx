type HowItWorksStep = {
  number: string;
  title: string;
  description: string;
};

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: "01",
    title: "Agents execute your workflow",
    description:
      "Planner, writer, compliance, and publisher agents run your pipeline end to end. Each step is logged with inputs, outputs, and timestamps — not buried in chat history.",
  },
  {
    number: "02",
    title: "Observer Agent verifies every step",
    description:
      "An independent observer watches each agent action in parallel — scoring identity, authority, intent, policy, and provenance. If a step violates policy, the observer blocks publication but the workflow still completes so you see the full output and receipt.",
  },
  {
    number: "03",
    title: "Trust Runtime scores the run",
    description:
      "Before the workflow advances, each action is evaluated against five trust dimensions. Failures are recorded with a clear reason and routed for human review when required.",
  },
  {
    number: "04",
    title: "You get a Trust Receipt",
    description:
      "A signed artifact records what ran, what passed, and why the output holds up. Verify it offline with the public key — no callback to our servers required.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-zinc-200/80 bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <header className="max-w-xl">
          <p className="text-sm font-medium tracking-[-0.01em] text-zinc-500">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-4xl">
            From brief to verifiable proof
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-600">
            Sits alongside your agent stack — proving what ran and why the
            result is safe to ship.
          </p>
        </header>

        <ol className="mt-16 space-y-16 lg:mt-20 lg:space-y-20">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <HowItWorksStepRow key={step.number} step={step} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function HowItWorksStepRow({ step }: { step: HowItWorksStep }) {
  return (
    <li className="list-none border-l border-zinc-200 pl-6 sm:pl-8">
      <span
        className="font-mono text-xs font-medium tabular-nums text-zinc-400"
        aria-hidden
      >
        {step.number}
      </span>
      <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-zinc-950">
        {step.title}
      </h3>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
        {step.description}
      </p>
    </li>
  );
}
