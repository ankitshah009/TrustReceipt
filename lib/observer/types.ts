/**
 * Trust Receipt Observer Agent — type definitions
 */

import type { WorkflowStep } from '../types';

export type ObserverVerdict = 'allow' | 'warn' | 'block';

export type TrustDimension =
  | 'identity'
  | 'authority'
  | 'intent'
  | 'policy'
  | 'provenance';

export interface ObserverDimensionCheck {
  dimension: TrustDimension;
  passed: boolean;
  detail: string;
}

export interface ObserverStepRecord {
  id: string;
  step: WorkflowStep;
  observedAgentId: string;
  timestamp: string;
  verdict: ObserverVerdict;
  blocked: boolean;
  interventionApplied: boolean;
  checks: ObserverDimensionCheck[];
  summary: string;
}

export interface ObserverState {
  agentId: 'trust-receipt-observer@v1';
  status: 'idle' | 'watching' | 'intervened' | 'complete';
  records: ObserverStepRecord[];
  publicationBlocked: boolean;
  blockReason?: string;
  interventionCount: number;
}

export type ObservedWorkflowStep = Exclude<WorkflowStep, 'IDLE' | 'COMPLETE'>;
