'use client';

import React, { memo } from 'react';
import { Eye, Loader2, Shield } from 'lucide-react';
import type { PipelineStepStatus } from './PipelineStep';

export interface ParallelFlowStep {
  key: string;
  label: string;
  agentLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  status: PipelineStepStatus;
}

interface ParallelAgentFlowProps {
  steps: ParallelFlowStep[];
  observerStatus: PipelineStepStatus;
  showRuntimeBar?: boolean;
  compact?: boolean;
}

const STATUS_RING: Record<PipelineStepStatus, string> = {
  pending: 'border-zinc-200 bg-zinc-50 text-zinc-400',
  active: 'border-violet-500 bg-white text-violet-600 ring-4 ring-violet-500/15',
  done: 'border-emerald-400/80 bg-white text-emerald-600',
  failed: 'border-red-400 bg-white text-red-600',
};

const CONNECTOR: Record<PipelineStepStatus, string> = {
  pending: 'border-zinc-200',
  active: 'border-violet-300',
  done: 'border-emerald-300',
  failed: 'border-red-300',
};

function StepNode({
  step,
  compact,
}: {
  step: ParallelFlowStep;
  compact?: boolean;
}) {
  const Icon = step.icon;
  return (
    <div className={`flex flex-col items-center ${compact ? 'min-w-[4.5rem]' : 'min-w-[5.5rem]'} shrink-0`}>
      <div
        className={`relative flex items-center justify-center rounded-xl border-2 transition-all duration-300 ${
          compact ? 'h-10 w-10' : 'h-11 w-11'
        } ${STATUS_RING[step.status]}`}
      >
        {step.status === 'active' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={1.75} />
        )}
      </div>
      <p className="mt-2 text-[9px] font-semibold uppercase tracking-wide text-violet-600/90">
        {step.agentLabel}
      </p>
      <p className="mt-0.5 max-w-[5rem] text-center text-[10px] font-medium leading-tight text-zinc-800">
        {step.label}
      </p>
      {!compact ? (
        <p className="mt-0.5 hidden max-w-[5.5rem] text-center text-[9px] leading-snug text-zinc-500 sm:block">
          {step.description}
        </p>
      ) : null}
    </div>
  );
}

function ParallelAgentFlowComponent({
  steps,
  observerStatus,
  showRuntimeBar = true,
  compact = false,
}: ParallelAgentFlowProps) {
  return (
    <div className="w-full">
      <div
        className="tr-pipeline-scroll flex w-full items-start overflow-x-auto pb-1"
        role="region"
        aria-label="Agent pipeline"
      >
        {steps.map((step, idx) => (
          <div key={step.key} className="flex min-w-0 flex-1 items-start">
            <StepNode step={step} compact={compact} />
            {idx < steps.length - 1 ? (
              <div
                className={`mt-5 flex min-w-[0.5rem] flex-1 items-center border-t-2 border-dotted px-0.5 ${CONNECTOR[step.status]}`}
                aria-hidden
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="relative mt-3 flex items-center gap-3 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-violet-50/40 px-3 py-2.5 sm:px-4">
        <div
          className="absolute -top-3 left-[12%] hidden h-3 w-px border-l-2 border-dotted border-amber-300/80 sm:block"
          aria-hidden
        />
        <div
          className="absolute -top-3 left-[12%] hidden h-3 w-8 border-t-2 border-dotted border-amber-300/80 sm:block"
          aria-hidden
        />
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 ${STATUS_RING[observerStatus]}`}
        >
          {observerStatus === 'active' ? (
            <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/90">
            Observer agent · parallel
          </p>
          <p className="text-[11px] leading-snug text-zinc-600">
            Independent verification on every pipeline step — runs concurrently, not sequentially
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-violet-700 ring-1 ring-violet-200/80 sm:inline">
          always-on
        </span>
      </div>

      {showRuntimeBar ? (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-full border border-violet-200/80 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2 shadow-sm">
          <Shield className="h-3.5 w-3.5 text-violet-600" strokeWidth={1.75} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-800/90">
            Trust runtime · continuous verification
          </span>
        </div>
      ) : null}
    </div>
  );
}

export const ParallelAgentFlow = memo(ParallelAgentFlowComponent);
