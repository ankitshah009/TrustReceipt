import { Scale, Megaphone, Layers } from "lucide-react";

const PERSONAS = [
  { icon: Scale, label: "Compliance & legal" },
  { icon: Megaphone, label: "GTM & content teams" },
  { icon: Layers, label: "Platform & security" },
] as const;

const STATS = [
  { value: "5", label: "Trust dimensions scored per run" },
  { value: "100%", label: "Offline receipt verification" },
  { value: "∥", label: "Observer runs beside every agent step" },
] as const;

export function StatsBar() {
  return (
    <section className="border-b border-zinc-200/80 bg-zinc-950 py-8 text-white sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
          Built for teams who ship with agents
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon;
            return (
              <span
                key={persona.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-zinc-200"
              >
                <Icon className="h-3.5 w-3.5 text-blue-400" strokeWidth={1.75} aria-hidden />
                {persona.label}
              </span>
            );
          })}
        </div>
        <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="font-mono text-2xl font-semibold tabular-nums text-white sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-sm text-zinc-400">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
