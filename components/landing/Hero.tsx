import { ArrowRight, Lock, Shield, Users } from 'lucide-react';
import { HeroWorkflowPreview } from '@/components/landing/HeroWorkflowPreview';

const FEATURES = [
  {
    icon: Shield,
    title: 'Verifiable offline',
    description: 'Validate signatures without our servers',
  },
  {
    icon: Lock,
    title: 'Tamper-evident',
    description: 'ECDSA P-256 signed receipts',
  },
  {
    icon: Users,
    title: 'Built for teams',
    description: 'Share proof with auditors & customers',
  },
] as const;

export function Hero() {
  return (
    <section id="product" className="tr-hero-grid border-b border-zinc-200/80">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 xl:gap-14">
          {/* Left column */}
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            <p className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-800">
              Runtime trust for agent workflows
            </p>

            <h1 className="mt-6 text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.03em] text-zinc-950 sm:text-[2.5rem] lg:text-[2.75rem]">
              The proof behind every{' '}
              <span className="tr-gradient-text">AI decision.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-zinc-600 sm:text-[17px] lg:mx-0">
              When agents draft, publish, or act on your behalf, Trust Receipt verifies every step
              and issues a signed receipt your team, customers, and auditors can validate offline —
              without trusting our servers.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="#app"
                className="tr-btn-gradient inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-[transform,box-shadow] hover:shadow-md hover:brightness-105 sm:w-auto"
              >
                Run the live workflow
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-200/90 bg-white/60 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-950 sm:w-auto"
              >
                See how verification works
              </a>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-4 lg:mt-12">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex flex-col items-center lg:items-start">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <p className="mt-2.5 text-sm font-semibold text-zinc-900">{feature.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <HeroWorkflowPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
