/**
 * Derive ObserverState from pipeline store when `observer` is not yet on the store.
 */

import type {
  ComplianceResult,
  DemoMode,
  StepHistoryEntry,
  TrustRuntimeState,
  WorkflowStep,
} from '../types';
import { WORKFLOW_STEPS } from '../types';
import { observeStep } from './observerAgent';
import type { ObserverState, ObserverStepRecord, ObservedWorkflowStep } from './types';
import { OBSERVER_AGENT_ID } from './observerAgent';

export interface DeriveObserverInput {
  brief: string;
  intent: string;
  mode: DemoMode;
  currentStep: WorkflowStep;
  stepHistory: StepHistoryEntry[];
  trustRuntime: TrustRuntimeState;
  complianceResult: ComplianceResult | null;
  humanReviewStatus: 'none' | 'pending' | 'approved' | 'rejected';
  isRunning: boolean;
  isComplete: boolean;
  hasStarted: boolean;
}

function isObservedStep(step: WorkflowStep): step is ObservedWorkflowStep {
  return (WORKFLOW_STEPS as readonly string[]).includes(step);
}

export function deriveObserverState(input: DeriveObserverInput): ObserverState {
  const {
    brief,
    intent,
    mode,
    stepHistory,
    trustRuntime,
    complianceResult,
    humanReviewStatus,
    isRunning,
    isComplete,
    hasStarted,
  } = input;

  const approvedDespiteFailure = humanReviewStatus === 'approved';
  const complianceFailed = complianceResult != null && !complianceResult.passed;
  const publicationBlocked =
    (complianceFailed && !approvedDespiteFailure) || humanReviewStatus === 'rejected';

  const blockReason = publicationBlocked
    ? complianceResult?.reasons.find((r) => r.status === 'FAIL')?.detail ??
      (humanReviewStatus === 'rejected' ? 'Publication rejected by reviewer' : 'Policy intervention')
    : undefined;

  const records: ObserverStepRecord[] = [];
  let recordIndex = 0;

  for (const entry of stepHistory) {
    if (!isObservedStep(entry.step) || entry.status === 'running') continue;

    const record = observeStep({
      step: entry.step,
      brief,
      intent,
      mode,
      stepOutput: entry.output,
      complianceResult: complianceResult ?? undefined,
      trustRuntime,
      publicationBlocked,
      recordIndex,
    });
    records.push(record);
    recordIndex += 1;
  }

  const interventionCount = records.filter(
    (r) => r.verdict === 'block' || r.verdict === 'warn' || r.interventionApplied,
  ).length;

  let status: ObserverState['status'] = 'idle';
  if (isComplete) {
    status = publicationBlocked ? 'intervened' : 'complete';
  } else if (isRunning || hasStarted) {
    status = publicationBlocked ? 'intervened' : 'watching';
  }

  return {
    agentId: OBSERVER_AGENT_ID,
    status,
    records,
    publicationBlocked,
    blockReason,
    interventionCount,
  };
}

/** Extract sourced vs claimed hours from brief and generated text (12h vs 24h pattern). */
export function extractHourClaims(
  brief: string,
  generated: string | null,
): {
  briefHours: number | null;
  generatedHours: number | null;
} {
  const briefMatch = brief.match(/(\d+)\s*(?:hour|hr)s?/i);
  const genMatch = generated?.match(/(\d+)\s*(?:hour|hr)s?/i);
  return {
    briefHours: briefMatch ? parseInt(briefMatch[1], 10) : null,
    generatedHours: genMatch ? parseInt(genMatch[1], 10) : null,
  };
}

export type {
  ObserverState,
  ObserverStepRecord,
  ObserverVerdict,
  TrustDimension,
} from './types';

export { OBSERVER_DIMENSIONS } from './constants';
