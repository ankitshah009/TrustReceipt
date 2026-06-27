/**
 * Observer Agent — deterministic step verification tests
 */
import { describe, it, expect } from 'vitest';
import { observeStep, OBSERVER_AGENT_ID } from '../lib/observer/observerAgent';
import {
  runComplianceCheck,
  HAPPY_BRIEF,
  OFF_POLICY_BRIEF,
  generateWriterDraft,
  generatePlannerOutput,
} from '../lib/sampleData';
import type { TrustRuntimeState } from '../lib/types';

const baseTrustRuntime: TrustRuntimeState = {
  identity: {
    user: 'ankit@trustreceipt.dev',
    agents: ['planner-agent@v1.3.2', OBSERVER_AGENT_ID],
    sessionId: 'sess_test',
  },
  authority: {
    authorized: true,
    role: 'content-creator',
    permissions: ['write:linkedin'],
    checkedAt: new Date().toISOString(),
  },
  intentAlignment: {
    score: 0,
    keywords: [],
    matchedTerms: [],
    driftDetected: false,
    lastComputed: new Date().toISOString(),
  },
  policyCompliance: {
    overallPass: true,
    alignmentScore: 0,
    violations: [],
    lastChecked: new Date().toISOString(),
  },
  provenance: {
    hashChain: [],
    stepCount: 0,
    rootHash: '0x00000000',
  },
};

describe('observeStep — happy path', () => {
  it('USER step allows when identity and authority are valid', () => {
    const record = observeStep({
      step: 'USER',
      brief: HAPPY_BRIEF,
      intent: 'Promote battery with sourced claims',
      mode: 'happy',
      stepOutput: {
        brief: HAPPY_BRIEF,
        intent: 'Promote battery with sourced claims',
        timestamp: new Date().toISOString(),
      },
      trustRuntime: baseTrustRuntime,
      recordIndex: 0,
    });

    expect(record.verdict).toBe('allow');
    expect(record.blocked).toBe(false);
    expect(record.interventionApplied).toBe(false);
    expect(record.checks.some((c) => c.dimension === 'identity' && c.passed)).toBe(true);
    expect(record.checks.some((c) => c.dimension === 'authority' && c.passed)).toBe(true);
  });

  it('WRITER happy path allows aligned draft with sourced hours', () => {
    const draft =
      'Our battery lasts 12 hours for consumer electronics. Tested in our lab under standard conditions with verified performance data.';

    const record = observeStep({
      step: 'WRITER',
      brief: HAPPY_BRIEF,
      intent: 'Accurate sourced claims',
      mode: 'happy',
      stepOutput: {
        draft,
        wordCount: draft.split(/\s+/).length,
        tone: 'professional',
        claims: ['12 hours'],
        timestamp: new Date().toISOString(),
      },
      trustRuntime: baseTrustRuntime,
      recordIndex: 2,
    });

    expect(record.verdict).toBe('allow');
    expect(record.blocked).toBe(false);
  });
});

describe('observeStep — off-policy writer', () => {
  it('WRITER off-policy warns when mode is off-policy without unsupported hour mismatch alone', () => {
    const planner = generatePlannerOutput(OFF_POLICY_BRIEF, true);
    const draft = generateWriterDraft(OFF_POLICY_BRIEF, planner, true);

    const record = observeStep({
      step: 'WRITER',
      brief: OFF_POLICY_BRIEF,
      intent: 'Maximum hype',
      mode: 'off-policy',
      stepOutput: {
        draft,
        wordCount: draft.split(/\s+/).length,
        tone: 'hype',
        claims: ['24 hours'],
        timestamp: new Date().toISOString(),
      },
      trustRuntime: baseTrustRuntime,
      recordIndex: 2,
    });

    expect(['warn', 'block']).toContain(record.verdict);
    expect(record.checks.some((c) => c.dimension === 'intent' && !c.passed)).toBe(true);
  });

  it('WRITER blocks when draft claims more hours than brief sources', () => {
    const brief =
      'Battery lasts 12 hours. Tested in our lab under standard conditions.';
    const draft =
      'Our revolutionary cells deliver 24 hours of continuous power in lab testing.';

    const record = observeStep({
      step: 'WRITER',
      brief,
      intent: 'Promote battery',
      mode: 'happy',
      stepOutput: {
        draft,
        wordCount: draft.split(/\s+/).length,
        tone: 'professional',
        claims: ['24 hours'],
        timestamp: new Date().toISOString(),
      },
      trustRuntime: baseTrustRuntime,
      recordIndex: 2,
    });

    expect(record.verdict).toBe('block');
    expect(record.blocked).toBe(true);
    expect(record.interventionApplied).toBe(false);
  });
});

describe('observeStep — compliance intervention', () => {
  it('COMPLIANCE failure blocks publication with interventionApplied', () => {
    const badDraft = 'Revolutionary breakthrough... lasts 24 hours...';
    const compliance = runComplianceCheck(OFF_POLICY_BRIEF, badDraft, true);

    const record = observeStep({
      step: 'COMPLIANCE',
      brief: OFF_POLICY_BRIEF,
      intent: 'Maximum hype',
      mode: 'off-policy',
      stepOutput: compliance,
      complianceResult: compliance,
      trustRuntime: baseTrustRuntime,
      recordIndex: 3,
    });

    expect(record.verdict).toBe('block');
    expect(record.blocked).toBe(true);
    expect(record.interventionApplied).toBe(true);
    expect(record.checks.some((c) => c.dimension === 'policy' && !c.passed)).toBe(true);
  });

  it('OUTPUT warns when publicationBlocked is already set', () => {
    const record = observeStep({
      step: 'OUTPUT',
      brief: HAPPY_BRIEF,
      intent: 'Test',
      mode: 'off-policy',
      stepOutput: {
        publishedPost: 'draft',
        receiptId: 'rcpt_test',
        timestamp: new Date().toISOString(),
      },
      trustRuntime: baseTrustRuntime,
      publicationBlocked: true,
      recordIndex: 5,
    });

    expect(record.verdict).toBe('warn');
    expect(record.blocked).toBe(true);
    expect(record.summary).toContain('Publication gated');
  });
});
