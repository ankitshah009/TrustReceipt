/**
 * Trust Receipt Demo - Simulation Engine
 * Realistic agent outputs using JS templates + timing + slight randomization
 */

import type {
  WorkflowStep,
  PlannerOutput,
  WriterOutput,
  ComplianceResult,
  PublisherOutput,
  FinalOutput,
  TraceLevel,
  DemoMode,
} from './types';

import {
  generatePlannerOutput,
  generateWriterDraft,
  generatePublisherPost,
  runComplianceCheck,
  computeIntentAlignment,
  generateHash,
  buildHashChain,
} from './sampleData';

// ============================================================================
// TIMING CONFIG (adjustable via speed control)
// ============================================================================

const BASE_DELAYS = {
  USER: 300,
  PLANNER: 650,
  WRITER: 900,
  COMPLIANCE: 750,
  PUBLISHER: 550,
  OUTPUT: 400,
  TRACE: 80,
  TRUST_UPDATE: 120,
} as const;

export function getDelay(step: WorkflowStep, speed: number): number {
  const base = BASE_DELAYS[step as keyof typeof BASE_DELAYS] ?? 500;
  // Speed > 1 means faster, so divide delay
  return Math.round(base / Math.max(0.25, speed));
}

// ============================================================================
// TRACE HELPERS
// ============================================================================

let traceCounter = 0;

export function createTrace(
  level: TraceLevel,
  agent: string,
  message: string,
  data?: Record<string, unknown>
) {
  traceCounter += 1;
  return {
    id: `trace-${Date.now()}-${traceCounter}`,
    timestamp: new Date().toISOString(),
    level,
    agent,
    message,
    data,
  };
}

// ============================================================================
// PROVENANCE
// ============================================================================

export function makeProvenanceRoot(receiptId: string): string {
  return generateHash(`root:${receiptId}:${Date.now()}`);
}

// ============================================================================
// STEP EXECUTORS
// ============================================================================

export interface StepExecutionResult {
  output: unknown;
  traceMessages: Array<{ level: TraceLevel; message: string; data?: Record<string, unknown> }>;
  trustUpdates?: {
    intentScore?: number;
    policyPass?: boolean;
    policyAlignment?: number;
    newHash?: string;
  };
}

export async function executeUserStep(
  brief: string,
  intent: string,
  mode: DemoMode
): Promise<StepExecutionResult> {
  const traceMessages = [
    { level: 'info' as TraceLevel, message: `Brief captured (${brief.length} chars)` },
    { level: 'info' as TraceLevel, message: `Intent set: "${intent.slice(0, 60)}..."` },
    { level: mode === 'off-policy' ? 'warning' as TraceLevel : 'success' as TraceLevel, 
      message: mode === 'off-policy' ? 'OFF-POLICY MODE: Aggressive claims detected in brief' : 'Happy path: All claims appear sourced' },
  ];
  
  return {
    output: {
      brief,
      intent,
      timestamp: new Date().toISOString(),
    },
    traceMessages,
  };
}

export async function executePlannerStep(
  brief: string,
  mode: DemoMode
): Promise<StepExecutionResult> {
  const planner = generatePlannerOutput(brief, mode === 'off-policy');
  
  const traceMessages = [
    { level: 'info' as TraceLevel, message: `Extracted ${planner.keyFacts.length} key facts` },
    { level: 'info' as TraceLevel, message: `Planned ${planner.plan.length} execution steps` },
    { level: mode === 'off-policy' ? 'warning' as TraceLevel : 'success' as TraceLevel,
      message: `Estimated claims: ${planner.estimatedClaims.join(', ')}` },
  ];
  
  const output: PlannerOutput = {
    ...planner,
    timestamp: new Date().toISOString(),
  };
  
  return {
    output,
    traceMessages,
    trustUpdates: {
      newHash: generateHash(JSON.stringify(planner)),
    },
  };
}

export async function executeWriterStep(
  brief: string,
  planner: PlannerOutput,
  mode: DemoMode
): Promise<StepExecutionResult> {
  const draft = generateWriterDraft(brief, planner, mode === 'off-policy');
  
  const words = draft.split(/\s+/).length;
  
  const traceMessages = [
    { level: 'info' as TraceLevel, message: `Draft generated: ${words} words` },
    { level: 'info' as TraceLevel, message: `Tone: ${mode === 'off-policy' ? 'Hype-forward' : 'Professional, sourced'}` },
    { level: mode === 'off-policy' ? 'warning' as TraceLevel : 'success' as TraceLevel,
      message: mode === 'off-policy' ? '⚠️ Draft contains aggressive claims' : 'Claims attributed to lab testing' },
  ];
  
  const output: WriterOutput = {
    draft,
    wordCount: words,
    tone: mode === 'off-policy' ? 'Promotional' : 'Professional',
    claims: planner.estimatedClaims,
    timestamp: new Date().toISOString(),
  };
  
  // Compute live intent alignment against brief
  const alignment = computeIntentAlignment(brief, draft);
  
  return {
    output,
    traceMessages,
    trustUpdates: {
      intentScore: alignment.score,
      newHash: generateHash(draft),
    },
  };
}

export async function executeComplianceStep(
  brief: string,
  draft: string,
  mode: DemoMode
): Promise<StepExecutionResult> {
  const result = runComplianceCheck(brief, draft, mode === 'off-policy');
  
  const traceMessages: Array<{ level: TraceLevel; message: string; data?: Record<string, unknown> }> = [];
  
  // Log each policy check
  for (const check of result.policyChecks) {
    traceMessages.push({
      level: check.passed ? 'success' : 'danger',
      message: `${check.passed ? '✓' : '✗'} ${check.rule}: ${check.detail}`,
    });
  }
  
  traceMessages.push({
    level: result.passed ? 'success' : 'danger',
    message: `Overall alignment: ${result.alignmentScore}% — ${result.passed ? 'PASSED' : 'FAILED'}`,
  });
  
  const output: ComplianceResult = {
    passed: result.passed,
    alignmentScore: result.alignmentScore,
    reasons: result.reasons,
    policyChecks: result.policyChecks,
    timestamp: new Date().toISOString(),
  };
  
  return {
    output,
    traceMessages,
    trustUpdates: {
      policyPass: result.passed,
      policyAlignment: result.alignmentScore,
      newHash: generateHash(JSON.stringify(result)),
    },
  };
}

export async function executePublisherStep(
  draft: string,
  mode: DemoMode
): Promise<StepExecutionResult> {
  const pub = generatePublisherPost(draft, mode === 'off-policy');
  
  const traceMessages = [
    { level: 'info' as TraceLevel, message: 'Formatted for LinkedIn distribution' },
    { level: 'info' as TraceLevel, message: `Hashtags: ${pub.hashtags.join(' ')}` },
    { level: mode === 'off-policy' ? 'warning' : 'success' as TraceLevel,
      message: mode === 'off-policy' ? '⚠️ Publishing with unresolved compliance flags' : 'Ready for distribution' },
  ];
  
  const output: PublisherOutput = {
    ...pub,
    timestamp: new Date().toISOString(),
  };
  
  return {
    output,
    traceMessages,
    trustUpdates: {
      newHash: generateHash(pub.linkedInPost),
    },
  };
}

export async function executeOutputStep(
  post: string,
  hashChain: string[]
): Promise<StepExecutionResult> {
  const receiptId = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  
  const traceMessages = [
    { level: 'success' as TraceLevel, message: 'Final output prepared for publication' },
    { level: 'info' as TraceLevel, message: `Receipt ID: ${receiptId}` },
    { level: 'info' as TraceLevel, message: `Provenance chain: ${hashChain.length} entries` },
  ];
  
  const output: FinalOutput = {
    publishedPost: post,
    receiptId,
    timestamp: new Date().toISOString(),
  };
  
  return {
    output,
    traceMessages,
  };
}

// ============================================================================
// FULL PIPELINE SIMULATION (for "Run Full Happy Path" shortcut)
// ============================================================================

export async function simulateFullPipeline(
  brief: string,
  intent: string,
  mode: DemoMode,
  onProgress: (step: WorkflowStep, result: StepExecutionResult) => void,
  speed: number = 1
): Promise<{ finalPost: string; receiptId: string; hashChain: string[] }> {
  const hashChain: string[] = [];
  
  // USER
  await new Promise(r => setTimeout(r, getDelay('USER', speed)));
  const userRes = await executeUserStep(brief, intent, mode);
  onProgress('USER', userRes);
  if (userRes.trustUpdates?.newHash) hashChain.push(userRes.trustUpdates.newHash);
  
  // PLANNER
  await new Promise(r => setTimeout(r, getDelay('PLANNER', speed)));
  const plannerRes = await executePlannerStep(brief, mode);
  onProgress('PLANNER', plannerRes);
  if (plannerRes.trustUpdates?.newHash) hashChain.push(plannerRes.trustUpdates.newHash);
  
  const planner = plannerRes.output as PlannerOutput;
  
  // WRITER
  await new Promise(r => setTimeout(r, getDelay('WRITER', speed)));
  const writerRes = await executeWriterStep(brief, planner, mode);
  onProgress('WRITER', writerRes);
  if (writerRes.trustUpdates?.newHash) hashChain.push(writerRes.trustUpdates.newHash);
  
  const writer = writerRes.output as WriterOutput;
  
  // COMPLIANCE
  await new Promise(r => setTimeout(r, getDelay('COMPLIANCE', speed)));
  const compRes = await executeComplianceStep(brief, writer.draft, mode);
  onProgress('COMPLIANCE', compRes);
  if (compRes.trustUpdates?.newHash) hashChain.push(compRes.trustUpdates.newHash);
  
  // PUBLISHER
  await new Promise(r => setTimeout(r, getDelay('PUBLISHER', speed)));
  const pubRes = await executePublisherStep(writer.draft, mode);
  onProgress('PUBLISHER', pubRes);
  if (pubRes.trustUpdates?.newHash) hashChain.push(pubRes.trustUpdates.newHash);
  
  const publisher = pubRes.output as PublisherOutput;
  
  // OUTPUT
  await new Promise(r => setTimeout(r, getDelay('OUTPUT', speed)));
  const outRes = await executeOutputStep(publisher.linkedInPost, hashChain);
  onProgress('OUTPUT', outRes);
  
  const final = outRes.output as FinalOutput;
  
  return {
    finalPost: publisher.linkedInPost,
    receiptId: final.receiptId,
    hashChain,
  };
}