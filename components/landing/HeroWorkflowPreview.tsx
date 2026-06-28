'use client';

import {
  Fingerprint,
  KeyRound,
  Link2,
  Shield,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { ParallelAgentFlow } from './ParallelAgentFlow';
import { previewParallelFlowSteps, PIPELINE_STEPS } from './pipelineConfig';

const RECEIPT_METRICS = [
  { label: 'Identity', icon: Fingerprint, accent: 'text-violet-400', bg: 'bg-violet-500/10' },
  { label: 'Authority', icon: KeyRound, accent: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Intent', icon: Target, accent: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Policy', icon: ShieldCheck, accent: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Provenance', icon: Link2, accent: 'text-amber-400', bg: 'bg-amber-500/10' },
] as const;

export function HeroWorkflowPreview() {
  const previewSteps = previewParallelFlowSteps('done');

  return (
    <div
      className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm shadow-zinc-900/[0.04] sm:p-5"
      aria-hidden
    >
      <ParallelAgentFlow
        steps={previewSteps}
        observerStatus="done"
        showRuntimeBar
        compact
      />

      <div className="tr-receipt-card mt-3 overflow-hidden rounded-xl">
        <div className="tr-card-header flex items-center justify-between px-3.5 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-violet-400" strokeWidth={1.75} />
            <span className="text-[11px] font-semibold text-slate-200">Trust Receipt</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">tr_8f2a…k9m1</span>
        </div>

        <div className="px-3.5 py-3 sm:px-4">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {RECEIPT_METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="tr-card-inner flex flex-col items-center rounded-lg px-1 py-2 text-center"
                >
                  <div
                    className={`mb-1 flex h-7 w-7 items-center justify-center rounded-md ${metric.bg}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${metric.accent}`} strokeWidth={1.75} />
                  </div>
                  <p className="text-[8px] font-medium uppercase tracking-wide text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold text-emerald-400">Pass</p>
                </div>
              );
            })}
          </div>

          <p className="safe-banner mt-3 py-2 text-center text-[11px] uppercase tracking-[0.12em]">
            Safe to publish
          </p>
          <p className="mt-2 text-center text-[9px] text-slate-500">
            {PIPELINE_STEPS.length} pipeline steps · observer parallel
          </p>
        </div>
      </div>
    </div>
  );
}
