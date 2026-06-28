'use client';

import React, { memo, useMemo } from 'react';
import type { ComplianceResult, TrustRuntimeState } from '@/lib/types';

export type TrustPillarKey = 'identity' | 'authority' | 'intent' | 'policy' | 'provenance';

export const TRUST_PILLARS: ReadonlyArray<{ key: TrustPillarKey; label: string }> = [
  { key: 'identity', label: 'Identity' },
  { key: 'authority', label: 'Authority' },
  { key: 'intent', label: 'Intent' },
  { key: 'policy', label: 'Policy' },
  { key: 'provenance', label: 'Provenance' },
] as const;

interface PillarDisplay {
  ok: boolean;
  value: string;
}

function resolvePillarState(
  key: TrustPillarKey,
  ctx: {
    hasStarted: boolean;
    isRunning: boolean;
    isComplete: boolean;
    liveStepIdx: number;
    trustRuntime: TrustRuntimeState;
    complianceResult: ComplianceResult | null;
    approvedDespiteFailure: boolean;
  },
): PillarDisplay {
  const {
    hasStarted,
    isRunning,
    isComplete,
    liveStepIdx,
    trustRuntime,
    complianceResult,
    approvedDespiteFailure,
  } = ctx;

  switch (key) {
    case 'identity':
      return { ok: hasStarted, value: hasStarted ? 'verified' : '—' };
    case 'authority':
      return { ok: hasStarted, value: hasStarted ? 'authorized' : '—' };
    case 'intent':
      return {
        ok: hasStarted && trustRuntime.intentAlignment.score >= 70,
        value: hasStarted ? `${trustRuntime.intentAlignment.score}%` : '—',
      };
    case 'policy':
      return {
        ok: complianceResult?.passed === true || approvedDespiteFailure,
        value: !complianceResult
          ? isRunning && liveStepIdx >= 3
            ? 'checking'
            : '—'
          : complianceResult.passed || approvedDespiteFailure
            ? 'passed'
            : 'failed',
      };
    case 'provenance':
      return {
        ok: isComplete,
        value: isComplete ? 'complete' : hasStarted ? 'building' : '—',
      };
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

interface TrustPillarsBarProps {
  hasStarted: boolean;
  isRunning: boolean;
  isComplete: boolean;
  liveStepIdx: number;
  trustRuntime: TrustRuntimeState;
  complianceResult: ComplianceResult | null;
  approvedDespiteFailure: boolean;
}

function TrustPillarsBarComponent({
  hasStarted,
  isRunning,
  isComplete,
  liveStepIdx,
  trustRuntime,
  complianceResult,
  approvedDespiteFailure,
}: TrustPillarsBarProps) {
  const pillars = useMemo(
    () =>
      TRUST_PILLARS.map((pillar) => ({
        ...pillar,
        state: resolvePillarState(pillar.key, {
          hasStarted,
          isRunning,
          isComplete,
          liveStepIdx,
          trustRuntime,
          complianceResult,
          approvedDespiteFailure,
        }),
      })),
    [
      hasStarted,
      isRunning,
      isComplete,
      liveStepIdx,
      trustRuntime,
      complianceResult,
      approvedDespiteFailure,
    ],
  );

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:flex sm:divide-x sm:divide-slate-200 sm:bg-slate-50/50">
      {pillars.map((pillar, index) => (
        <div
          key={pillar.key}
          className={`min-w-0 bg-slate-50/50 px-2.5 py-2 sm:flex-1 sm:bg-transparent sm:px-3 ${
            index === pillars.length - 1 ? "col-span-2 sm:col-span-1" : ""
          }`}
        >
          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500 truncate">
            {pillar.label}
          </div>
          <div
            className={`mt-0.5 font-mono text-[11px] tabular-nums truncate ${
              pillar.state.ok ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {pillar.state.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export const TrustPillarsBar = memo(TrustPillarsBarComponent);
