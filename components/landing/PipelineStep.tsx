'use client';

import React, { memo } from 'react';
import { CheckCircle2, Loader2, XCircle, type LucideIcon } from 'lucide-react';

export type PipelineStepStatus = 'pending' | 'active' | 'done' | 'failed';

export interface PipelineStepConfig {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export type PipelineConnectorStatus = 'pending' | 'active' | 'done' | 'failed';

interface PipelineStepProps {
  step: PipelineStepConfig;
  status: PipelineStepStatus;
  showConnector?: boolean;
  connectorStatus?: PipelineConnectorStatus;
}

function connectorClass(status: PipelineConnectorStatus): string {
  switch (status) {
    case 'done':
      return 'bg-slate-400';
    case 'active':
      return 'bg-[#2563eb]/70';
    case 'failed':
      return 'bg-red-400/80';
    case 'pending':
      return 'bg-slate-200';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function resolveConnectorStatus(
  current: PipelineStepStatus,
  next: PipelineStepStatus | undefined,
): PipelineConnectorStatus {
  if (current === 'failed') return 'failed';
  if (current === 'done') return 'done';
  if (current === 'active' || next === 'active') return 'active';
  return 'pending';
}

function PipelineStepComponent({
  step,
  status,
  showConnector = false,
  connectorStatus = 'pending',
}: PipelineStepProps) {
  const Icon = step.icon;

  const nodeClass =
    status === 'failed'
      ? 'border-red-300/80 bg-white text-red-600'
      : status === 'active'
        ? 'border-[#2563eb] bg-white text-[#2563eb] ring-2 ring-[#2563eb]/15'
        : status === 'done'
          ? 'border-slate-300 bg-white text-slate-700'
          : 'border-slate-200 bg-slate-50/80 text-slate-400';

  return (
    <div className="flex flex-1 min-w-[2.75rem] sm:min-w-0 items-start">
      <div className="flex flex-col items-center min-w-[2.75rem] shrink-0 sm:min-w-[3.25rem]">
        <div
          className={`relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border transition-all duration-300 ${nodeClass}`}
        >
          {status === 'active' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === 'done' ? (
            <CheckCircle2
              className={`h-4 w-4 ${status === 'done' ? 'text-emerald-600' : ''}`}
            />
          ) : status === 'failed' ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <Icon className="h-3.5 w-3.5" />
          )}
        </div>
        <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-medium text-slate-700 truncate max-w-[3.5rem] sm:max-w-[4.5rem] text-center leading-tight">
          {step.label}
        </p>
        <p className="mt-0.5 text-[9px] text-slate-400 leading-tight hidden sm:block text-center max-w-[4.5rem] truncate">
          {step.description}
        </p>
      </div>

      {showConnector && (
        <div
          className="flex flex-1 items-center pt-[18px] px-0.5 min-w-[0.375rem]"
          aria-hidden
        >
          <div
            className={`h-px w-full transition-colors duration-500 ${connectorClass(connectorStatus)}`}
          />
        </div>
      )}
    </div>
  );
}

export { resolveConnectorStatus };

export const PipelineStep = memo(PipelineStepComponent);
