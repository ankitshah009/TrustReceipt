import { Bot, FileText, Pencil, Send, Shield, User } from 'lucide-react';
import type { PipelineStepConfig, PipelineStepStatus } from './PipelineStep';
import type { ParallelFlowStep } from './ParallelAgentFlow';

/**
 * Canonical pipeline definition — single source of truth for all workflow UI.
 * Hero previews, parallel flow, step timeline, and receipt trace derive from here.
 */
export const PIPELINE_STEPS: PipelineStepConfig[] = [
  { key: 'USER', label: 'User', icon: User, description: 'Provided brief & intent' },
  { key: 'PLANNER', label: 'Planner Agent', icon: Bot, description: 'Extracted facts & plan' },
  { key: 'WRITER', label: 'Writer Agent', icon: Pencil, description: 'Generated content' },
  { key: 'COMPLIANCE', label: 'Compliance Agent', icon: Shield, description: 'Checked policy & claims' },
  { key: 'PUBLISHER', label: 'Publisher Agent', icon: Send, description: 'Prepared to publish' },
  { key: 'OUTPUT', label: 'Output', icon: FileText, description: 'LinkedIn post (draft)' },
];

export const STEP_ORDER = PIPELINE_STEPS.map((s) => s.key);

/** Display role for parallel-flow UI (Input / Agent / Result). */
export function agentLabelForStep(stepKey: string): string {
  switch (stepKey) {
    case 'USER':
      return 'Input';
    case 'OUTPUT':
      return 'Result';
    default:
      return 'Agent';
  }
}

/** Map canonical steps + live statuses into parallel-flow nodes (augmentation only). */
export function toParallelFlowSteps(
  steps: PipelineStepConfig[],
  statuses: PipelineStepStatus[],
): ParallelFlowStep[] {
  return steps.map((step, idx) => ({
    key: step.key,
    label: step.label,
    agentLabel: agentLabelForStep(step.key),
    description: step.description,
    icon: step.icon,
    status: statuses[idx] ?? 'pending',
  }));
}

/** Static preview for marketing hero — all steps complete. */
export function previewParallelFlowSteps(
  status: PipelineStepStatus = 'done',
): ParallelFlowStep[] {
  return toParallelFlowSteps(
    PIPELINE_STEPS,
    PIPELINE_STEPS.map(() => status),
  );
}
