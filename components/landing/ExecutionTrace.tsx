'use client';

import React, { memo } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { PipelineStepStatus } from './PipelineStep';

export interface TraceStep {
  key: string;
  label: string;
  status: PipelineStepStatus;
}

const NODE_COLORS: Record<PipelineStepStatus, string> = {
  pending: 'bg-zinc-700 border-zinc-600 text-zinc-500',
  active: 'bg-violet-600 border-violet-400 text-white ring-4 ring-violet-500/25',
  done: 'bg-emerald-600 border-emerald-400 text-white',
  failed: 'bg-red-600 border-red-400 text-white',
};

const LINE_COLORS: Record<PipelineStepStatus, string> = {
  pending: 'bg-zinc-700',
  active: 'bg-violet-500/60',
  done: 'bg-emerald-500/70',
  failed: 'bg-red-500/70',
};

interface ExecutionTraceProps {
  steps: TraceStep[];
}

function ExecutionTraceComponent({ steps }: ExecutionTraceProps) {
  return (
    <div className="mt-4 pt-4 border-t border-white/[0.06]">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        Execution trace
      </p>
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {steps.map((step, idx) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${NODE_COLORS[step.status]}`}
                title={step.label}
              >
                {step.status === 'active' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : step.status === 'done' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                )}
              </div>
              <span className="mt-1 max-w-[3.5rem] truncate text-[8px] text-slate-500">
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 ? (
              <div
                className={`mx-0.5 h-0.5 w-4 sm:w-6 shrink-0 rounded-full ${LINE_COLORS[step.status === 'done' ? 'done' : 'pending']}`}
                aria-hidden
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export const ExecutionTrace = memo(ExecutionTraceComponent);
