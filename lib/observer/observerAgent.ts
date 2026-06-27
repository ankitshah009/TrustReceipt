/**
 * Trust Receipt Observer Agent — deterministic step verification (no LLM)
 */

import type {
  ComplianceResult,
  DemoMode,
  PlannerOutput,
  TrustRuntimeState,
  UserInput,
  WriterOutput,
} from '../types';
import {
  computeIntentAlignment,
  generateHash,
} from '../sampleData';
import type {
  ObserverDimensionCheck,
  ObserverStepRecord,
  ObserverVerdict,
  ObservedWorkflowStep,
} from './types';

export const OBSERVER_AGENT_ID = 'trust-receipt-observer@v1' as const;

const STEP_AGENT_MAP: Record<ObservedWorkflowStep, string> = {
  USER: 'user@trustreceipt.dev',
  PLANNER: 'planner-agent@v1.3.2',
  WRITER: 'writer-agent@v1.3.2',
  COMPLIANCE: 'compliance-agent@v1.3.2',
  PUBLISHER: 'publisher-agent@v1.3.2',
  OUTPUT: 'output-agent@v1',
};

export interface ObserverStepContext {
  step: ObservedWorkflowStep;
  brief: string;
  intent: string;
  mode: DemoMode;
  stepOutput: unknown;
  complianceResult?: ComplianceResult;
  trustRuntime: Partial<TrustRuntimeState>;
  publicationBlocked?: boolean;
  recordIndex: number;
}

function makeRecordId(step: ObservedWorkflowStep, recordIndex: number): string {
  return `obs-${step.toLowerCase()}-${recordIndex}`;
}

function checkIdentity(trustRuntime: Partial<TrustRuntimeState>): ObserverDimensionCheck {
  const identity = trustRuntime.identity;
  const userPresent = Boolean(identity?.user?.includes('@'));
  const sessionPresent = Boolean(identity?.sessionId);
  const agentsRegistered = (identity?.agents?.length ?? 0) > 0;
  const passed = userPresent && sessionPresent && agentsRegistered;

  return {
    dimension: 'identity',
    passed,
    detail: passed
      ? `Session ${identity!.sessionId} bound to ${identity!.user}`
      : 'Identity context incomplete — missing user, session, or agent registry',
  };
}

function checkAuthority(trustRuntime: Partial<TrustRuntimeState>): ObserverDimensionCheck {
  const authority = trustRuntime.authority;
  const passed = Boolean(authority?.authorized);

  return {
    dimension: 'authority',
    passed,
    detail: passed
      ? `Role "${authority!.role}" authorized with ${authority!.permissions.length} permissions`
      : 'Authority check failed — actions not authorized for this session',
  };
}

function checkUnsupportedHours(
  brief: string,
  draft: string
): { unsupported: boolean; detail: string } {
  const draftMatch = draft.match(/(\d+)\s*(hour|hr)s?/i);
  if (!draftMatch) {
    return { unsupported: false, detail: 'No time-based claims in draft' };
  }

  const claimedHours = parseInt(draftMatch[1], 10);
  const briefHasSource = /tested|lab|standard conditions|source|study/i.test(brief);
  const briefMentionsHours = brief.match(/(\d+)\s*(hour|hr)s?/i);
  const sourcedHours = briefMentionsHours ? parseInt(briefMentionsHours[1], 10) : null;

  if (!briefHasSource && claimedHours > 0) {
    return {
      unsupported: true,
      detail: `Draft claims ${claimedHours}h but brief provides no test data or source`,
    };
  }
  if (sourcedHours !== null && claimedHours > sourcedHours) {
    return {
      unsupported: true,
      detail: `Draft claims ${claimedHours}h but brief only sources ${sourcedHours}h`,
    };
  }

  return {
    unsupported: false,
    detail: `Battery claim of ${claimedHours}h matches brief sourcing`,
  };
}

function resolveVerdict(checks: ObserverDimensionCheck[]): {
  verdict: ObserverVerdict;
  blocked: boolean;
  interventionApplied: boolean;
} {
  const failedPolicy = checks.some((c) => c.dimension === 'policy' && !c.passed);
  const failedIntent = checks.some((c) => c.dimension === 'intent' && !c.passed);
  const anyFailed = checks.some((c) => !c.passed);

  if (failedPolicy) {
    return { verdict: 'block', blocked: true, interventionApplied: true };
  }
  if (failedIntent) {
    return { verdict: 'block', blocked: true, interventionApplied: false };
  }
  if (anyFailed) {
    return { verdict: 'warn', blocked: false, interventionApplied: false };
  }
  return { verdict: 'allow', blocked: false, interventionApplied: false };
}

function buildRecord(
  ctx: ObserverStepContext,
  checks: ObserverDimensionCheck[],
  summary: string,
  overrides?: Partial<Pick<ObserverStepRecord, 'verdict' | 'blocked' | 'interventionApplied' | 'summary'>>
): ObserverStepRecord {
  const resolved = resolveVerdict(checks);
  const verdict = overrides?.verdict ?? resolved.verdict;
  const blocked = overrides?.blocked ?? resolved.blocked;
  const interventionApplied = overrides?.interventionApplied ?? resolved.interventionApplied;

  return {
    id: makeRecordId(ctx.step, ctx.recordIndex),
    step: ctx.step,
    observedAgentId: STEP_AGENT_MAP[ctx.step],
    timestamp: new Date().toISOString(),
    verdict,
    blocked,
    interventionApplied,
    checks,
    summary: overrides?.summary ?? summary,
  };
}

export function observeStep(ctx: ObserverStepContext): ObserverStepRecord {
  const { step, brief, mode, stepOutput, complianceResult, trustRuntime, publicationBlocked } =
    ctx;

  switch (step) {
    case 'USER': {
      const output = stepOutput as UserInput;
      const checks: ObserverDimensionCheck[] = [
        checkIdentity(trustRuntime),
        checkAuthority(trustRuntime),
        {
          dimension: 'intent',
          passed: Boolean(output.brief?.length && output.intent?.length),
          detail: `Brief (${output.brief?.length ?? 0} chars) and intent captured`,
        },
      ];
      return buildRecord(ctx, checks, 'User input verified — identity and authority established');
    }

    case 'PLANNER': {
      const output = stepOutput as PlannerOutput;
      const factsExtracted = output.keyFacts.length > 0 && output.estimatedClaims.length > 0;
      const plannerHash = generateHash(JSON.stringify(output));

      const checks: ObserverDimensionCheck[] = [
        {
          dimension: 'intent',
          passed: factsExtracted,
          detail: factsExtracted
            ? `Extracted ${output.keyFacts.length} facts, ${output.estimatedClaims.length} claims scoped to intent`
            : 'Planner produced no extractable facts or claims',
        },
        {
          dimension: 'provenance',
          passed: Boolean(plannerHash),
          detail: `Planner output hashed (${plannerHash}) — ${output.sources.length} source(s) referenced`,
        },
      ];

      if (mode === 'off-policy') {
        checks.push({
          dimension: 'policy',
          passed: false,
          detail: 'Off-policy brief flagged — planner recorded unsourced claim risk',
        });
      }

      return buildRecord(
        ctx,
        checks,
        factsExtracted
          ? 'Planner output grounded with provenance hash'
          : 'Planner output missing expected fact extraction'
      );
    }

    case 'WRITER': {
      const output = stepOutput as WriterOutput;
      const alignment = computeIntentAlignment(brief, output.draft);
      const hoursCheck = checkUnsupportedHours(brief, output.draft);
      const offPolicyMode = mode === 'off-policy';
      const intentIssue = offPolicyMode || hoursCheck.unsupported;

      const checks: ObserverDimensionCheck[] = [
        {
          dimension: 'intent',
          passed: !intentIssue,
          detail: intentIssue
            ? [
                offPolicyMode ? 'off-policy mode active' : null,
                hoursCheck.unsupported ? hoursCheck.detail : null,
              ]
                .filter(Boolean)
                .join('; ')
            : `Intent alignment ${alignment.score}% — draft matches brief scope`,
        },
        {
          dimension: 'provenance',
          passed: Boolean(output.draft?.length),
          detail: `Writer draft (${output.wordCount} words) fingerprint ${generateHash(output.draft)}`,
        },
      ];

      if (hoursCheck.unsupported) {
        return buildRecord(
          ctx,
          checks,
          'Writer blocked — unsupported hours vs brief sourcing',
          { verdict: 'block', blocked: true, interventionApplied: false }
        );
      }

      if (offPolicyMode) {
        return buildRecord(
          ctx,
          checks,
          'Writer flagged — off-policy mode (warn)',
          { verdict: 'warn', blocked: false, interventionApplied: false }
        );
      }

      return buildRecord(ctx, checks, 'Writer output aligned with brief and intent');
    }

    case 'COMPLIANCE': {
      const policyResult =
        complianceResult ?? (stepOutput as ComplianceResult);

      const checks: ObserverDimensionCheck[] = [
        {
          dimension: 'policy',
          passed: policyResult.passed,
          detail: policyResult.passed
            ? `Policy compliance ${policyResult.alignmentScore}% — all critical rules satisfied`
            : `Policy violations: ${policyResult.reasons
                .filter((r) => r.status === 'FAIL')
                .map((r) => r.detail)
                .join('; ') || 'compliance failed'}`,
        },
      ];

      const failed = !policyResult.passed;
      return buildRecord(
        ctx,
        checks,
        failed ? 'Compliance failed — publication blocked by Observer' : 'Compliance passed — policy dimension clear',
        {
          verdict: failed ? 'block' : 'allow',
          blocked: failed,
          interventionApplied: failed,
        }
      );
    }

    case 'PUBLISHER': {
      const checks: ObserverDimensionCheck[] = [
        {
          dimension: 'provenance',
          passed: true,
          detail: publicationBlocked
            ? 'Publisher ran under Observer gate — output recorded only'
            : 'Publisher output formatted and ready for distribution',
        },
      ];

      if (publicationBlocked) {
        return buildRecord(ctx, checks, 'Publication gated — output recorded but not cleared to publish', {
          verdict: 'warn',
          blocked: true,
          interventionApplied: false,
        });
      }

      return buildRecord(ctx, checks, 'Publisher step cleared — no active Observer blocks');
    }

    case 'OUTPUT': {
      const checks: ObserverDimensionCheck[] = [
        {
          dimension: 'provenance',
          passed: true,
          detail: publicationBlocked
            ? 'Final output persisted with NEEDS REVIEW status'
            : 'Final output persisted with full trust clearance',
        },
      ];

      if (publicationBlocked) {
        return buildRecord(ctx, checks, 'Publication gated — output recorded but not cleared to publish', {
          verdict: 'warn',
          blocked: true,
          interventionApplied: false,
        });
      }

      return buildRecord(ctx, checks, 'Output step complete — receipt eligible for publication');
    }

    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

export type { ObserverStepRecord, ObserverState, ObserverVerdict } from './types';
