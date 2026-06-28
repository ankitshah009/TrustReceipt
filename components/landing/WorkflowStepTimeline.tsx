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
import { deriveObserverState } from '@/lib/observer/deriveObserverState';
import { useTrustDemo } from '@/lib/store';
import type { StepHistoryEntry, WorkflowStep } from '@/lib/types';
import { WORKFLOW_STEPS } from '@/lib/types';

const STEP_META: Record<
  Exclude<WorkflowStep, 'IDLE' | 'COMPLETE'>,
  { label: string; icon: LucideIcon }
> = {
  USER: { label: 'User', icon: User },
  PLANNER: { label: 'Planner Agent', icon: Bot },
  WRITER: { label: 'Writer Agent', icon: Pencil },
  COMPLIANCE: { label: 'Compliance Agent', icon: Shield },
  PUBLISHER: { label: 'Publisher Agent', icon: Send },
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
  const summary = record?.summary ?? (entry?.status === 'success' ? 'Completed — verified by Observer' : (rowStatus === 'pending' ? 'Not started' : 'In progress…'));
  const duration = formatDuration(entry?.duration);

  const isDone = rowStatus === 'done';
  const isRunningStatus = rowStatus === 'running';
  const isBlocked = rowStatus === 'blocked';

  const cardClass = isBlocked
    ? 'border-red-200 bg-red-50/30'
    : isRunningStatus
      ? 'border-blue-200 bg-blue-50/20'
      : isDone
        ? 'border-zinc-200 bg-white'
        : 'border-zinc-100 bg-zinc-50/40';

  return (
    <li>
      <div className={`mb-2 rounded-xl border p-3 transition-colors ${cardClass}`}>
        <button
          type="button"
          onClick={onToggle}
          disabled={!record}
          className="flex w-full items-center gap-3 text-left disabled:cursor-default"
        >
          {/* Left status like image */}
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isDone ? 'border-emerald-500 bg-emerald-500 text-white' : isRunningStatus ? 'border-blue-500 bg-white text-blue-600' : isBlocked ? 'border-red-400 bg-red-100 text-red-600' : 'border-zinc-300 bg-white text-zinc-400'}`}>
            {isDone ? '✓' : isRunningStatus ? <span className="h-2 w-2 animate-pulse rounded-full bg-current" /> : <Icon className="h-3 w-3" strokeWidth={2} />}
          </div>

          {/* Icon and text */}
          <div className="flex flex-1 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-950">{meta.label}</span>
                <span className="ml-2 font-mono text-[10px] text-zinc-400">{duration}</span>
              </div>
              <p className="text-xs leading-tight text-zinc-600">{summary}</p>
            </div>
          </div>

          {record ? (
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          ) : (
            <span className="h-4 w-4" />
          )}
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
              <div className="mt-2 border-t border-zinc-100 pt-2">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">Dimension checks</p>
                <div className="space-y-0.5 text-xs">
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
                  <p className="mt-1 text-xs leading-relaxed text-red-700">{record.summary}</p>
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
  const stepHistory = useTrustDemo((s) => s.stepHistory);
  const currentStep = useTrustDemo((s) => s.currentStep);
  const isRunning = useTrustDemo((s) => s.controls.isRunning);
  const isComplete = useTrustDemo((s) => s.controls.isComplete);
  const signedReceipt = useTrustDemo((s) => s.signedReceipt);
  const receipt = useTrustDemo((s) => s.receipt);
  const brief = useTrustDemo((s) => s.brief);
  const intent = useTrustDemo((s) => s.intent);
  const mode = useTrustDemo((s) => s.mode);
  const trustRuntime = useTrustDemo((s) => s.trustRuntime);
  const complianceResult = useTrustDemo((s) => s.complianceResult);
  const humanReviewStatus = useTrustDemo((s) => s.humanReviewStatus);

  // Always derive from stepHistory for timeline to guarantee full records + correct "done" summaries after run completes.
  // (store observer may be stale post-reset or on fast complete transitions)
  const derivedObserver = useMemo(() => deriveObserverState({
    brief,
    intent,
    mode,
    currentStep,
    stepHistory,
    trustRuntime,
    complianceResult,
    humanReviewStatus,
    isRunning,
    isComplete,
    hasStarted: isRunning || isComplete || currentStep !== 'IDLE',
  }), [brief, intent, mode, currentStep, stepHistory, trustRuntime, complianceResult, humanReviewStatus, isRunning, isComplete]);

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

  // Derive run info to match image
  const runTitle = brief ? `LinkedIn Post: ${brief.slice(0, 30)}...` : 'LinkedIn Post: Product Launch';
  const runDate = signedReceipt?.timestamp || receipt?.createdAt || new Date().toLocaleString();
  const runId = signedReceipt?.id || receipt?.receiptId || 'TR-' + Math.random().toString(36).slice(2, 10).toUpperCase();

  return (
    <div className="tr-card p-4 sm:p-5">
      {/* Header matching Image #1 */}
      <div className="mb-4">
        <div className="text-xs font-semibold tracking-widest text-purple-600">WORKFLOW RUN</div>
        <div className="mt-2 p-3 bg-white border border-zinc-200 rounded-xl text-sm">
          <div className="font-medium">{runTitle}</div>
          <div className="mt-0.5 flex items-center justify-between text-xs text-zinc-500">
            <span>{runDate}</span>
            <span className="font-mono flex items-center gap-1">
              ID: {runId} 
              <button 
                onClick={() => { navigator.clipboard.writeText(runId); }} 
                className="text-zinc-400 hover:text-zinc-600"
                title="Copy ID"
              >
                📋
              </button>
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-xs">
        <p className="font-semibold tracking-tight text-zinc-950">Pipeline steps</p>
        <span className="font-mono text-zinc-400">{stepHistory.filter((h) => h.status === 'success').length}/{WORKFLOW_STEPS.length}</span>
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

      <button 
        onClick={() => { /* could link to full trace */ }} 
        className="mt-3 w-full py-2 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50"
      >
        View full trace
      </button>
    </div>
  );
}

export const WorkflowStepTimeline = memo(WorkflowStepTimelineComponent);
