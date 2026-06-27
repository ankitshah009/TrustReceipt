'use client';

import React, { memo, useMemo } from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ObserverState, ObserverStepRecord, ObserverVerdict } from '@/lib/observer/types';
import { useObserverState } from '@/lib/useObserverState';
import { useTrustDemo } from '@/lib/store';

const STATUS_COPY: Record<ObserverState['status'], { label: string; detail: string }> = {
  idle: { label: 'Standing by', detail: 'Runtime monitor armed — activates with workflow' },
  watching: { label: 'Observing', detail: 'Continuous verification across all pipeline steps' },
  intervened: { label: 'Intervention', detail: 'Policy breach detected — publication halted' },
  complete: { label: 'Verified', detail: 'Full run observed — receipt eligible' },
};

const VERDICT_STYLES: Record<
  ObserverVerdict,
  { badge: string; dot: string; label: string }
> = {
  allow: {
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-200/80',
    dot: 'bg-emerald-500',
    label: 'Allow',
  },
  warn: {
    badge: 'bg-amber-50 text-amber-900 ring-amber-200/80',
    dot: 'bg-amber-500',
    label: 'Warn',
  },
  block: {
    badge: 'bg-red-50 text-red-900 ring-red-200/80',
    dot: 'bg-red-500',
    label: 'Block',
  },
};

const FEED_LIMIT = 3;

interface ObserverAgentPanelProps {
  observer?: ObserverState;
  compact?: boolean;
}

const VerdictBadge = memo(function VerdictBadge({ verdict }: { verdict: ObserverVerdict }) {
  const style = VERDICT_STYLES[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
});

const FeedRow = memo(function FeedRow({ record }: { record: ObserverStepRecord }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{record.step}</p>
        <p className="mt-0.5 truncate text-sm text-zinc-800">{record.summary}</p>
      </div>
      <VerdictBadge verdict={record.verdict} />
    </li>
  );
});

function statusIndicatorClass(status: ObserverState['status'], isRunning: boolean): string {
  if (status === 'watching' || (isRunning && status !== 'intervened')) {
    return 'bg-blue-500/15 text-blue-700 ring-blue-500/25';
  }
  if (status === 'intervened') {
    return 'bg-amber-500/15 text-amber-900 ring-amber-500/30';
  }
  if (status === 'complete') {
    return 'bg-emerald-500/15 text-emerald-800 ring-emerald-500/25';
  }
  return 'bg-zinc-100 text-zinc-600 ring-zinc-200/80';
}

function ObserverAgentPanelComponent({ observer: observerProp, compact = false }: ObserverAgentPanelProps) {
  const derivedObserver = useObserverState();
  const isRunning = useTrustDemo((s) => s.controls.isRunning);
  const observer = observerProp ?? derivedObserver;

  const copy = STATUS_COPY[observer.status];
  const recentRecords = useMemo(
    () => observer.records.slice(-FEED_LIMIT).reverse(),
    [observer.records],
  );

  const Icon = observer.status === 'intervened' ? ShieldCheck : Eye;
  const pulseActive = isRunning && observer.status === 'watching';

  return (
    <div className="tr-card overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <div
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${statusIndicatorClass(observer.status, isRunning)}`}
          >
            {pulseActive ? (
              <span className="absolute inset-0 animate-ping rounded-lg bg-blue-400/20" aria-hidden />
            ) : null}
            <Icon className="relative h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <p className="tr-section-label">Observer agent</p>
            <p className="text-sm font-semibold tracking-tight text-zinc-950">{copy.label}</p>
            {!compact ? (
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{copy.detail}</p>
            ) : null}
          </div>
        </div>
        <span className="rounded-md bg-zinc-50 px-2 py-1 font-mono text-[10px] tabular-nums text-zinc-500 ring-1 ring-zinc-100">
          always-on
        </span>
      </div>

      <AnimatePresence mode="wait">
        {observer.publicationBlocked ? (
          <motion.div
            key="blocked"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/80 px-4 py-3 sm:px-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-900">
              Publication blocked
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-950/90">
              {observer.blockReason ?? 'Output failed continuous policy verification before release.'}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500">Live verification feed</p>
          {observer.interventionCount > 0 ? (
            <span className="font-mono text-[10px] tabular-nums text-amber-700">
              {observer.interventionCount} intervention{observer.interventionCount === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>

        {recentRecords.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-3 py-4 text-center text-xs text-zinc-500">
            Awaiting pipeline events — observer records each step in real time
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-100 bg-zinc-50/30 px-3">
            {recentRecords.map((record) => (
              <FeedRow key={record.id} record={record} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export const ObserverAgentPanel = memo(ObserverAgentPanelComponent);
