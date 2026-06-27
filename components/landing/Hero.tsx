const PREVIEW_CHECKS = [
  { label: "Identity", value: "4 agents verified" },
  { label: "Authority", value: "Within scope" },
  { label: "Intent", value: "94% aligned" },
  { label: "Policy", value: "Passed" },
  { label: "Provenance", value: "100% grounded" },
] as const;

export function Hero() {
  return (
    <section id="product" className="border-b border-zinc-200/80 bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pb-32 sm:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.02em] text-zinc-950 sm:text-[2.75rem] sm:leading-[1.12]">
            The proof behind every AI decision.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-[17px]">
            Verify agent workflows from intent to execution, then issue a
            cryptographically signed receipt anyone can inspect offline.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <a
              href="#app"
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
            >
              Start a workflow
            </a>
            <a
              href="#how-it-works"
              className="inline-flex w-full items-center justify-center px-2 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 sm:w-auto"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-2xl sm:mt-24">
          <div
            className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-sm shadow-zinc-900/[0.04]"
            aria-hidden
          >
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-300" />
                <span className="h-2 w-2 rounded-full bg-zinc-300" />
                <span className="h-2 w-2 rounded-full bg-zinc-300" />
                <span className="ml-1 text-xs text-zinc-400">Trust Receipt</span>
              </div>
              <span className="font-mono text-[11px] text-zinc-400">
                tr_8f2a…k9m1
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium tracking-[-0.01em] text-zinc-950">
                    Workflow receipt
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    ECDSA P-256 · offline verification
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Verified
                </span>
              </div>

              <ul className="mt-5 divide-y divide-zinc-100 border-t border-zinc-100">
                {PREVIEW_CHECKS.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-4 py-2.5 text-[13px]"
                  >
                    <span className="text-zinc-500">{row.label}</span>
                    <span className="font-mono text-xs text-zinc-700">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 border-t border-zinc-100 pt-4 font-mono text-[10px] leading-relaxed text-zinc-400">
                sig:3045…a1b2 · issued 2026-06-27T14:32:01Z
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
