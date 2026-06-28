'use client';

import { useMemo } from 'react';
import { useTrustDemo } from '@/lib/store';
import type { ObserverState } from '@/lib/observer/types';
import { deriveObserverState } from '@/lib/observer/deriveObserverState';
import type { TrustDemoState } from '@/lib/types';

type StoreWithObserver = TrustDemoState & { observer?: ObserverState };

export function useObserverState(): ObserverState {
  const brief = useTrustDemo((s) => s.brief);
  const intent = useTrustDemo((s) => s.intent);
  const mode = useTrustDemo((s) => s.mode);
  const currentStep = useTrustDemo((s) => s.currentStep);
  const stepHistory = useTrustDemo((s) => s.stepHistory);
  const trustRuntime = useTrustDemo((s) => s.trustRuntime);
  const complianceResult = useTrustDemo((s) => s.complianceResult);
  const humanReviewStatus = useTrustDemo((s) => s.humanReviewStatus);
  const isRunning = useTrustDemo((s) => s.controls.isRunning);
  const isComplete = useTrustDemo((s) => s.controls.isComplete);

  const hasStarted = isRunning || isComplete || currentStep !== 'IDLE';

  // Always derive from stepHistory + humanReviewStatus etc. The stored observer can
  // become stale (especially after human approve/reject or partial step() runs).
  // Timeline already did this; now making the hook consistent for all consumers.
  return useMemo(() => deriveObserverState({
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
    hasStarted,
  }), [
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
    hasStarted,
  ]);
}
