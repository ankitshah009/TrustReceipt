import { KeyRound, Lock, ServerOff, ShieldCheck, Users } from "lucide-react";

const BADGES = [
  { icon: Lock, label: "ECDSA P-256 signatures" },
  { icon: ServerOff, label: "Offline verification" },
  { icon: ShieldCheck, label: "Parallel observer agent" },
  { icon: Users, label: "Human review in receipt" },
  { icon: KeyRound, label: "Server-side API keys only" },
] as const;

export function SecurityBadges() {
  return (
    <section className="border-b border-zinc-200/80 bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
          Production-minded by design
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <li
                key={badge.label}
                className="inline-flex list-none items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/80 px-3.5 py-2 text-xs font-medium text-zinc-700"
              >
                <Icon className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.75} aria-hidden />
                {badge.label}
              </li>
            );
          })}
        </ul>
        <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-relaxed text-zinc-500">
          Public demo includes per-IP rate limits, input validation, security headers, and IP
          blocklists. For enterprise pilots: SSO, dedicated quotas, and audit logging.
        </p>
      </div>
    </section>
  );
}
