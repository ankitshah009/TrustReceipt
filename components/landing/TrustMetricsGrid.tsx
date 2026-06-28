'use client';

import React, { memo } from 'react';
import {
  Fingerprint,
  KeyRound,
  Link2,
  ShieldCheck,
  Target,
  type LucideIcon,
} from 'lucide-react';

export type TrustMetricKey = 'identity' | 'authority' | 'intent' | 'policy' | 'provenance';

export interface TrustMetric {
  key: TrustMetricKey;
  label: string;
  status: string;
  detail: string;
  ok: boolean;
}

const METRIC_ICONS: Record<TrustMetricKey, { icon: LucideIcon; accent: string; bg: string }> = {
  identity: { icon: Fingerprint, accent: 'text-violet-400', bg: 'bg-violet-500/10 ring-violet-500/20' },
  authority: { icon: KeyRound, accent: 'text-blue-400', bg: 'bg-blue-500/10 ring-blue-500/20' },
  intent: { icon: Target, accent: 'text-indigo-400', bg: 'bg-indigo-500/10 ring-indigo-500/20' },
  policy: { icon: ShieldCheck, accent: 'text-emerald-400', bg: 'bg-emerald-500/10 ring-emerald-500/20' },
  provenance: { icon: Link2, accent: 'text-amber-400', bg: 'bg-amber-500/10 ring-amber-500/20' },
};

interface TrustMetricsGridProps {
  metrics: TrustMetric[];
  variant?: 'dark' | 'light';
}

function TrustMetricsGridComponent({ metrics, variant = 'dark' }: TrustMetricsGridProps) {
  const isDark = variant === 'dark';

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-2">
      {metrics.map((metric) => {
        const style = METRIC_ICONS[metric.key];
        const Icon = style.icon;
        return (
          <div
            key={metric.key}
            className={`rounded-xl p-2.5 sm:p-3 ${
              isDark
                ? 'bg-white/[0.03] ring-1 ring-white/[0.06]'
                : 'bg-zinc-50 ring-1 ring-zinc-200/80'
            }`}
          >
            <div
              className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${style.bg}`}
            >
              <Icon className={`h-4 w-4 ${style.accent}`} strokeWidth={1.75} />
            </div>
            <p
              className={`text-[10px] font-medium uppercase tracking-wide ${
                isDark ? 'text-slate-500' : 'text-zinc-500'
              }`}
            >
              {metric.label}
            </p>
            <p
              className={`mt-0.5 text-sm font-semibold tabular-nums ${
                metric.ok
                  ? isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-700'
                  : isDark
                    ? 'text-amber-300'
                    : 'text-amber-700'
              }`}
            >
              {metric.status}
            </p>
            <p
              className={`mt-0.5 text-[10px] leading-snug ${
                isDark ? 'text-slate-500' : 'text-zinc-500'
              }`}
            >
              {metric.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export const TrustMetricsGrid = memo(TrustMetricsGridComponent);
