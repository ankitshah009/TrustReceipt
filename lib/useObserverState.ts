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
  const storeObserver = useTrustDemo((s) => (s as StoreWithObserver).observer);

  const hasStarted = isRunning || isComplete || currentStep !== 'IDLE';

  return useMemo(() => {
    if (storeObserver) return storeObserver;
    return deriveObserverState({
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
    });
  }, [
    storeObserver,
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
