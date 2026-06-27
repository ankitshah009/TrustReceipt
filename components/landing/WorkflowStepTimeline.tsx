'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  Bot,
  ChevronDown,
  FileText,
  Pencil,
  Send,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ObserverState, ObserverStepRecord, ObserverVerdict } from '@/lib/observer/types';
import { OBSERVER_DIMENSIONS } from '@/lib/observer/constants';
import { useObserverState } from '@/lib/useObserverState';
import { useTrustDemo } from '@/lib/store';
import type { StepHistoryEntry, WorkflowStep } from '@/lib/types';
import { WORKFLOW_STEPS } from '@/lib/types';

const STEP_META: Record<
  Exclude<WorkflowStep, 'IDLE' | 'COMPLETE'>,
  { label: string; icon: LucideIcon }
> = {
  USER: { label: 'User', icon: User },
  PLANNER: { label: 'Planner', icon: Bot },
  WRITER: { label: 'Writer', icon: Pencil },
  COMPLIANCE: { label: 'Compliance', icon: Shield },
  PUBLISHER: { label: 'Publisher', icon: Send },
  OUTPUT: { label: 'Output', icon: FileText },
};

const VERDICT_CHIP: Record<ObserverVerdict, string> = {
  allow: 'bg-emerald-50 text-emerald-800 ring-emerald-200/70',
  warn: 'bg-amber-50 text-amber-900 ring-amber-200/70',
  block: 'bg-red-50 text-red-900 ring-red-200/70',
};

function formatDuration(ms: number | undefined): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function resolveRowStatus(
  step: Exclude<WorkflowStep, 'IDLE' | 'COMPLETE'>,
  entry: StepHistoryEntry | undefined,
  record: ObserverStepRecord | undefined,
  isActive: boolean,
): 'pending' | 'running' | 'done' | 'failed' | 'blocked' {
  if (record?.verdict === 'block' || entry?.status === 'failed') return 'blocked';
  if (entry?.status === 'running' || isActive) return 'running';
  if (entry?.status === 'success') return 'done';
  return 'pending';
}

interface TimelineRowProps {
  step: Exclude<WorkflowStep, 'IDLE' | 'COMPLETE'>;
  entry: StepHistoryEntry | undefined;
  record: ObserverStepRecord | undefined;
  isActive: boolean;
  expanded: boolean;
  onToggle: () => void;
}

const DimensionRow = memo(function DimensionRow({
  label,
  passed,
  summary,
}: {
  label: string;
  passed: boolean;
  summary: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-[11px] text-zinc-500">{label}</span>
      <div className="min-w-0 flex-1 text-right">
        <span
          className={`font-mono text-[11px] tabular-nums ${passed ? 'text-emerald-700' : 'text-red-700'}`}
        >
          {passed ? '✓' : '✗'}
        </span>
        <span className="ml-1.5 text-[11px] text-zinc-600">{summary}</span>
      </div>
    </div>
  );
});

const TimelineRow = memo(function TimelineRow({
  step,
  entry,
  record,
  isActive,
  expanded,
  onToggle,
}: TimelineRowProps) {
  const meta = STEP_META[step];
  const Icon = meta.icon;
  const rowStatus = resolveRowStatus(step, entry, record, isActive);
  const verdict = record?.verdict;
  const summary = record?.summary ?? (rowStatus === 'pending' ? 'Not started' : 'In progress…');
  const duration = formatDuration(entry?.duration);

  const rowBorder =
    rowStatus === 'blocked'
      ? 'border-red-200/90 bg-red-50/30'
      : rowStatus === 'running'
        ? 'border-blue-200/80 bg-blue-50/20'
        : rowStatus === 'done'
          ? 'border-zinc-200/80 bg-white'
          : 'border-zinc-100 bg-zinc-50/40 opacity-70';

  const nodeClass =
    rowStatus === 'blocked'
      ? 'border-red-300 bg-red-100 text-red-700'
      : rowStatus === 'running'
        ? 'border-blue-500 bg-white text-blue-600 ring-2 ring-blue-500/15'
        : rowStatus === 'done'
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border-zinc-200 bg-zinc-100 text-zinc-400';

  return (
    <li className="relative pl-8">
      <span
        className={`absolute left-[11px] top-0 bottom-0 w-px ${
          rowStatus === 'blocked' ? 'bg-red-200' : rowStatus === 'done' ? 'bg-zinc-200' : 'bg-zinc-100'
        }`}
        aria-hidden
      />
      <span
        className={`absolute left-0 top-3 flex h-[22px] w-[22px] items-center justify-center rounded-full border ${nodeClass}`}
      >
        <Icon className="h-3 w-3" strokeWidth={1.75} />
      </span>

      <div className={`mb-3 rounded-lg border transition-colors ${rowBorder}`}>
        <button
          type="button"
          onClick={onToggle}
          disabled={!record}
          className="flex w-full items-start gap-3 px-3 py-3 text-left disabled:cursor-default sm:px-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900">{meta.label}</span>
              <span className="font-mono text-[10px] tabular-nums text-zinc-400">{duration}</span>
              {verdict ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${VERDICT_CHIP[verdict]}`}
                >
                  {verdict}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-snug text-zinc-600">{summary}</p>
          </div>
          {record ? (
            <ChevronDown
              className={`mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          ) : null}
        </button>

        <AnimatePresence initial={false}>
          {expanded && record ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-zinc-100 px-3 pb-3 pt-2 sm:px-4">
                <p className="tr-section-label mb-2">Dimension checks</p>
                <div className="tr-card-inset divide-y divide-zinc-100/80 px-3 py-1">
                  {record.checks.map((dim) => {
                    const label =
                      OBSERVER_DIMENSIONS.find((d) => d.key === dim.dimension)?.label ??
                      dim.dimension;
                    return (
                      <DimensionRow
                        key={dim.dimension}
                        label={label}
                        passed={dim.passed}
                        summary={dim.detail}
                      />
                    );
                  })}
                </div>
                {record.blocked && record.verdict === 'block' ? (
                  <p className="mt-2 text-xs leading-relaxed text-red-800/90">{record.summary}</p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  );
});

interface WorkflowStepTimelineProps {
  observer?: ObserverState;
}

function WorkflowStepTimelineComponent({ observer: observerProp }: WorkflowStepTimelineProps) {
  const derivedObserver = useObserverState();
  const stepHistory = useTrustDemo((s) => s.stepHistory);
  const currentStep = useTrustDemo((s) => s.currentStep);
  const isRunning = useTrustDemo((s) => s.controls.isRunning);
  const observer = observerProp ?? derivedObserver;

  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const recordsByStep = useMemo(() => {
    const map = new Map<string, ObserverStepRecord>();
    for (const record of observer.records) {
      map.set(record.step, record);
    }
    return map;
  }, [observer.records]);

  const handleToggle = useCallback((step: string) => {
    setExpandedStep((prev) => (prev === step ? null : step));
  }, []);

  return (
    <div className="tr-card p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="tr-section-label">Execution timeline</p>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-950">
            Pipeline steps with observer verdicts
          </h3>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-zinc-400">
          {observer.records.length}/{WORKFLOW_STEPS.length}
        </span>
      </div>

      <ol className="relative space-y-0">
        {WORKFLOW_STEPS.map((step) => {
          const entry = stepHistory.find((h) => h.step === step);
          const record = recordsByStep.get(step);
          const isActive = isRunning && currentStep === step;

          return (
            <TimelineRow
              key={step}
              step={step}
              entry={entry}
              record={record}
              isActive={isActive}
              expanded={expandedStep === step}
              onToggle={() => handleToggle(step)}
            />
          );
        })}
      </ol>
    </div>
  );
}

export const WorkflowStepTimeline = memo(WorkflowStepTimelineComponent);
