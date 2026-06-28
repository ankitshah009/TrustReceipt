export function FinalCta() {
  return (
    <section className="bg-zinc-950 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Turn your next agent run into proof.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
          Run the workflow below, inspect the observer feed, and download a signed receipt you
          can verify without trusting us.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="#app"
            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 sm:w-auto"
          >
            Run the live workflow
          </a>
          <a
            href="#contact"
            className="inline-flex w-full items-center justify-center rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/5 sm:w-auto"
          >
            Talk to the team
          </a>
        </div>
      </div>
    </section>
  );
}
