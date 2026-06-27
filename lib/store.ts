/**
 * Trust Receipt Demo - Zustand State Machine Store
 * Orchestrates the full pipeline, trust runtime, trace, and controls
 */

import { create } from 'zustand';
import type {
  TrustDemoState,
  TrustDemoActions,
  WorkflowStep,
  DemoMode,
  Identity,
  Authority,
  IntentAlignment,
  PolicyCompliance,
  Provenance,
  TrustRuntimeState,
  StepHistoryEntry,
  ReceiptData,
} from './types';

import {
  DEFAULT_BRIEF,
  DEFAULT_INTENT,
  getBriefForMode,
  computeIntentAlignment,
  generateHash,
  buildHashChain,
} from './sampleData';

import {
  createTrace,
  executeUserStep,
  executePlannerStep,
  executeWriterStep,
  executeComplianceStep,
  executePublisherStep,
  executeOutputStep,
  getDelay,
} from './simulator';

import { generateSignedReceipt, verifySignedReceipt, downloadReceiptJSON, type SignedTrustReceipt } from './receipt';

// ============================================================================
// INITIAL TRUST RUNTIME STATE
// ============================================================================

const INITIAL_IDENTITY: Identity = {
  user: 'ankit@trustreceipt.dev',
  agents: [
    'planner-agent@v1.3.2',
    'writer-agent@v1.3.2',
    'compliance-agent@v1.3.2',
    'publisher-agent@v1.3.2',
  ],
  sessionId: `sess_${Date.now().toString(36)}`,
};

const INITIAL_AUTHORITY: Authority = {
  authorized: true,
  role: 'content-creator',
  permissions: ['write:linkedin', 'read:brand-guidelines', 'invoke:agents'],
  checkedAt: new Date().toISOString(),
};

const INITIAL_INTENT: IntentAlignment = {
  score: 0,
  keywords: [],
  matchedTerms: [],
  driftDetected: false,
  lastComputed: new Date().toISOString(),
};

const INITIAL_POLICY: PolicyCompliance = {
  overallPass: true,
  alignmentScore: 0,
  violations: [],
  lastChecked: new Date().toISOString(),
};

const INITIAL_PROVENANCE: Provenance = {
  hashChain: [],
  stepCount: 0,
  rootHash: '0x00000000',
};

const INITIAL_TRUST_RUNTIME: TrustRuntimeState = {
  identity: INITIAL_IDENTITY,
  authority: INITIAL_AUTHORITY,
  intentAlignment: INITIAL_INTENT,
  policyCompliance: INITIAL_POLICY,
  provenance: INITIAL_PROVENANCE,
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const INITIAL_STATE: TrustDemoState = {
  currentStep: 'IDLE',
  brief: DEFAULT_BRIEF,
  intent: DEFAULT_INTENT,
  mode: 'happy',
  userInput: null,
  plannerOutput: null,
  writerOutput: null,
  complianceResult: null,
  publisherOutput: null,
  finalOutput: null,
  trustRuntime: INITIAL_TRUST_RUNTIME,
  trace: [],
  stepHistory: [],
  controls: {
    isRunning: false,
    isPaused: false,
    isComplete: false,
    speed: 1,
    currentStepIndex: -1,
    mode: 'happy',
  },
  receipt: null,
  signedReceipt: null,
  humanReviewStatus: 'none',
};

// ============================================================================
// STORE
// ============================================================================

export const useTrustDemo = create<TrustDemoState & TrustDemoActions>((set, get) => ({
  ...INITIAL_STATE,

  // --------------------------------------------------------------------------
  // INPUT ACTIONS
  // --------------------------------------------------------------------------
  setBrief: (brief: string) => {
    set({ brief });
    // Recompute intent alignment if we have writer output
    const { writerOutput } = get();
    if (writerOutput) {
      get().computeIntentAlignment();
    }
  },

  setIntent: (intent: string) => {
    set({ intent });
  },

  // --------------------------------------------------------------------------
  // MODE
  // --------------------------------------------------------------------------
  setMode: (mode: DemoMode) => {
    const ctrl = get().controls;
    const { isRunning } = ctrl;
    if (isRunning) return; // Don't allow mode switch mid-run
    
    const { brief, intent } = getBriefForMode(mode);
    set({
      mode,
      brief,
      intent,
      controls: { ...ctrl, mode },
      // Reset outputs when switching modes
      userInput: null,
      plannerOutput: null,
      writerOutput: null,
      complianceResult: null,
      publisherOutput: null,
      finalOutput: null,
      trace: [],
      stepHistory: [],
      receipt: null,
      signedReceipt: null,
      humanReviewStatus: 'none',
      currentStep: 'IDLE',
    });
  },

  // --------------------------------------------------------------------------
  // MAIN DEMO RUNNER
  // --------------------------------------------------------------------------
  runDemo: async () => {
    const state = get();
    if (state.controls.isRunning) return;

    // Reset if complete
    if (state.controls.isComplete) {
      get().reset();
      // Give reset a tick
      await new Promise(r => setTimeout(r, 10));
    }

    set({
      controls: {
        ...get().controls,
        isRunning: true,
        isPaused: false,
        isComplete: false,
        currentStepIndex: -1,
      },
      currentStep: 'USER',
      trace: [],
      stepHistory: [],
    });

    get().addTrace({ level: 'info', agent: 'SYSTEM', message: `Starting ${state.mode} pipeline run` });

    try {
      // Execute sequentially
      await get().executeStep('USER');
      if (get().controls.isPaused) return;
      
      await get().executeStep('PLANNER');
      if (get().controls.isPaused) return;
      
      await get().executeStep('WRITER');
      if (get().controls.isPaused) return;
      
      await get().executeStep('COMPLIANCE');
      if (get().controls.isPaused) return;
      
      await get().executeStep('PUBLISHER');
      if (get().controls.isPaused) return;
      
      await get().executeStep('OUTPUT');
      
      // Mark complete
      set({
        controls: { ...get().controls, isRunning: false, isComplete: true },
        currentStep: 'COMPLETE',
      });
      
      get().addTrace({ level: 'success', agent: 'SYSTEM', message: 'Pipeline complete. Receipt ready.' });
      
      // Generate final receipt + cryptographic signature
      get()._generateReceipt();
      get().generateCryptographicReceipt();
      
    } catch (e) {
      get().addTrace({ level: 'danger', agent: 'SYSTEM', message: `Error: ${(e as Error).message}` });
      set({ controls: { ...get().controls, isRunning: false } });
    }
  },

  runHappyPath: async () => {
    const { mode } = get();
    if (mode !== 'happy') {
      get().setMode('happy');
      await new Promise(r => setTimeout(r, 50));
    }
    await get().runDemo();
  },

  triggerViolation: async () => {
    const { mode } = get();
    if (mode !== 'off-policy') {
      get().setMode('off-policy');
      await new Promise(r => setTimeout(r, 50));
    }
    await get().runDemo();
  },

  // --------------------------------------------------------------------------
  // STEP EXECUTION (core state machine)
  // --------------------------------------------------------------------------
  executeStep: async (step: WorkflowStep) => {
    const state = get();
    const { speed, isPaused } = state.controls;
    
    if (isPaused) return;

    // Update current step
    set({ currentStep: step });
    
    // Record step start in history
    const stepEntry: StepHistoryEntry = {
      step,
      status: 'running',
      startTime: new Date().toISOString(),
    };
    
    set({
      stepHistory: [...state.stepHistory, stepEntry],
      controls: {
        ...state.controls,
        currentStepIndex: WORKFLOW_STEP_INDEX[step] ?? -1,
      },
    });

    get().addTrace({ level: 'info', agent: step, message: `▶ ${step} started` });

    // Simulate work + get realistic output
    const delay = getDelay(step, speed);
    await new Promise(r => setTimeout(r, delay));

    let result: Awaited<ReturnType<typeof executeUserStep>>;
    
    try {
      switch (step) {
        case 'USER': {
          result = await executeUserStep(state.brief, state.intent, state.mode);
          set({ userInput: result.output as import('./types').UserInput });
          break;
        }
        case 'PLANNER': {
          result = await executePlannerStep(state.brief, state.intent, state.mode);
          set({ plannerOutput: result.output as import('./types').PlannerOutput });
          break;
        }
        case 'WRITER': {
          const planner = state.plannerOutput!;
          result = await executeWriterStep(state.brief, state.intent, planner, state.mode);
          set({ writerOutput: result.output as import('./types').WriterOutput });
          break;
        }
        case 'COMPLIANCE': {
          const writer = state.writerOutput!;
          result = await executeComplianceStep(state.brief, writer.draft, state.mode);
          const comp = result.output as import('./types').ComplianceResult;
          set({ complianceResult: comp });
          
          // Update trust runtime policy state immediately
          get().updateTrustRuntime({
            policyCompliance: {
              overallPass: comp.passed,
              alignmentScore: comp.alignmentScore,
              violations: comp.reasons.filter(r => r.status === 'FAIL').map(r => r.detail),
              lastChecked: new Date().toISOString(),
            },
          });
          break;
        }
        case 'PUBLISHER': {
          const writer = state.writerOutput!;
          result = await executePublisherStep(writer.draft, state.mode);
          set({ publisherOutput: result.output as import('./types').PublisherOutput });
          break;
        }
        case 'OUTPUT': {
          const pub = state.publisherOutput!;
          const hashChain = state.trustRuntime.provenance.hashChain;
          result = await executeOutputStep(pub.linkedInPost, hashChain);
          set({ finalOutput: result.output as import('./types').FinalOutput });
          break;
        }
        default:
          return;
      }

      // Add trace messages from step
      for (const tm of result.traceMessages) {
        get().addTrace({ level: tm.level, agent: step, message: tm.message, data: tm.data });
      }

      // Update provenance
      if (result.trustUpdates?.newHash) {
        const newChain = [...state.trustRuntime.provenance.hashChain, result.trustUpdates.newHash];
        get().updateTrustRuntime({
          provenance: {
            hashChain: newChain,
            stepCount: newChain.length,
            rootHash: newChain[0] || '0x00000000',
          },
        });
      }

      // Live intent alignment updates (on writer step and after)
      if (step === 'WRITER' || step === 'COMPLIANCE') {
        get().computeIntentAlignment();
      }

      // Update live trust numbers
      if (result.trustUpdates?.intentScore !== undefined) {
        get().updateTrustRuntime({
          intentAlignment: {
            ...state.trustRuntime.intentAlignment,
            score: result.trustUpdates.intentScore,
            lastComputed: new Date().toISOString(),
          },
        });
      }

      // Mark step success in history
      const updatedHistory = state.stepHistory.map((h, i) =>
        i === state.stepHistory.length - 1
          ? {
              ...h,
              status: (step === 'COMPLIANCE' && state.complianceResult && !state.complianceResult.passed)
                ? 'failed' as const
                : 'success' as const,
              endTime: new Date().toISOString(),
              output: result.output,
              duration: Date.now() - new Date(h.startTime!).getTime(),
            }
          : h
      );
      set({ stepHistory: updatedHistory });

      get().addTrace({ level: 'success', agent: step, message: `✓ ${step} complete` });

    } catch (e) {
      get().addTrace({ level: 'danger', agent: step, message: `✗ ${step} failed: ${(e as Error).message}` });
      // Mark failed
      const updatedHistory = state.stepHistory.map((h, i) =>
        i === state.stepHistory.length - 1 ? { ...h, status: 'failed' as const, endTime: new Date().toISOString() } : h
      );
      set({ stepHistory: updatedHistory });
    }
  },

  // --------------------------------------------------------------------------
  // SIMULATION CONTROLS
  // --------------------------------------------------------------------------
  pause: () => {
    set({
      controls: { ...get().controls, isPaused: true, isRunning: false },
    });
    get().addTrace({ level: 'warning', agent: 'SYSTEM', message: '⏸ Simulation paused' });
  },

  resume: async () => {
    const state = get();
    if (!state.controls.isPaused || state.controls.isComplete) return;

    set({
      controls: { ...state.controls, isPaused: false, isRunning: true },
    });
    get().addTrace({ level: 'info', agent: 'SYSTEM', message: '▶ Resuming...' });

    // Continue from current step
    const idx = WORKFLOW_STEP_INDEX[state.currentStep] ?? 0;
    const remaining = WORKFLOW_STEPS.slice(idx);

    for (const step of remaining) {
      if (get().controls.isPaused) break;
      await get().executeStep(step);
      // Small gap between steps
      await new Promise(r => setTimeout(r, 60 / get().controls.speed));
    }

    if (!get().controls.isPaused) {
      set({
        controls: { ...get().controls, isRunning: false, isComplete: true },
        currentStep: 'COMPLETE',
      });
      get()._generateReceipt();
      get().generateCryptographicReceipt();
    }
  },

  step: async () => {
    const state = get();
    if (state.controls.isRunning) return;

    const currentIdx = WORKFLOW_STEP_INDEX[state.currentStep] ?? -1;
    const nextIdx = currentIdx + 1;
    
    if (nextIdx >= WORKFLOW_STEPS.length) {
      set({ controls: { ...state.controls, isComplete: true }, currentStep: 'COMPLETE' });
      get()._generateReceipt();
      return;
    }

    const nextStep = WORKFLOW_STEPS[nextIdx];
    await get().executeStep(nextStep);
  },

  reset: () => {
    const { mode, brief, intent } = get();
    set({
      ...INITIAL_STATE,
      mode,
      brief,
      intent,
      controls: {
        ...INITIAL_STATE.controls,
        mode,
        speed: get().controls.speed,
      },
      trustRuntime: {
        ...INITIAL_TRUST_RUNTIME,
        identity: INITIAL_IDENTITY,
        authority: { ...INITIAL_AUTHORITY, checkedAt: new Date().toISOString() },
      },
    });
  },

  setSpeed: (speed: number) => {
    set({
      controls: { ...get().controls, speed: Math.max(0.25, Math.min(4, speed)) },
    });
  },

  // --------------------------------------------------------------------------
  // HUMAN REVIEW (off-policy flow)
  // --------------------------------------------------------------------------
  routeToHuman: () => {
    set({ humanReviewStatus: 'pending' });
    get().addTrace({ 
      level: 'warning', 
      agent: 'COMPLIANCE', 
      message: '🚨 Routed to human reviewer — STATUS NEEDS REVIEW' 
    });
  },

  approveHuman: () => {
    const state = get();
    set({ humanReviewStatus: 'approved' });
    get().addTrace({ level: 'success', agent: 'HUMAN', message: 'Human reviewer APPROVED publication' });
    
    // If we were blocked, now allow finalization
    if (state.currentStep === 'COMPLIANCE' || state.currentStep === 'PUBLISHER') {
      // Continue pipeline
      setTimeout(() => {
        get().executeStep('PUBLISHER').then(() => get().executeStep('OUTPUT')).then(() => {
          set({ 
            controls: { ...get().controls, isComplete: true, isRunning: false },
            currentStep: 'COMPLETE',
          });
          get()._generateReceipt();
          get().generateCryptographicReceipt();
        });
      }, 200);
    }
  },

  rejectHuman: () => {
    set({ humanReviewStatus: 'rejected' });
    get().addTrace({ level: 'danger', agent: 'HUMAN', message: 'Human reviewer REJECTED — publication blocked' });
    set({
      controls: { ...get().controls, isRunning: false, isComplete: true },
    });
  },

  // --------------------------------------------------------------------------
  // TRUST RUNTIME LIVE UPDATES
  // --------------------------------------------------------------------------
  updateTrustRuntime: (partial: Partial<TrustRuntimeState>) => {
    set((state) => ({
      trustRuntime: {
        ...state.trustRuntime,
        ...partial,
        // Deep merge for nested objects
        intentAlignment: partial.intentAlignment 
          ? { ...state.trustRuntime.intentAlignment, ...partial.intentAlignment }
          : state.trustRuntime.intentAlignment,
        policyCompliance: partial.policyCompliance
          ? { ...state.trustRuntime.policyCompliance, ...partial.policyCompliance }
          : state.trustRuntime.policyCompliance,
        provenance: partial.provenance
          ? { ...state.trustRuntime.provenance, ...partial.provenance }
          : state.trustRuntime.provenance,
      },
    }));
  },

  computeIntentAlignment: () => {
    const state = get();
    const currentText = state.writerOutput?.draft || state.brief;
    
    const alignment = computeIntentAlignment(state.brief, currentText);
    
    // Animate the score change
    const currentScore = state.trustRuntime.intentAlignment.score;
    const targetScore = alignment.score;
    
    // If running, do a quick animated update
    if (state.controls.isRunning) {
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          const interpolated = Math.round(currentScore + ((targetScore - currentScore) * (i / steps)));
          set((s) => ({
            trustRuntime: {
              ...s.trustRuntime,
              intentAlignment: {
                ...s.trustRuntime.intentAlignment,
                score: interpolated,
                keywords: alignment.keywords,
                matchedTerms: alignment.matchedTerms,
                driftDetected: alignment.driftDetected,
                lastComputed: new Date().toISOString(),
              },
            },
          }));
        }, i * 40);
      }
    } else {
      set((s) => ({
        trustRuntime: {
          ...s.trustRuntime,
          intentAlignment: {
            ...s.trustRuntime.intentAlignment,
            score: targetScore,
            keywords: alignment.keywords,
            matchedTerms: alignment.matchedTerms,
            driftDetected: alignment.driftDetected,
            lastComputed: new Date().toISOString(),
          },
        },
      }));
    }
  },

  generateProvenanceHash: (data: string) => generateHash(data),

  // --------------------------------------------------------------------------
  // TRACE
  // --------------------------------------------------------------------------
  addTrace: (entry) => {
    const trace = createTrace(entry.level, entry.agent, entry.message, entry.data);
    set((state) => ({
      trace: [...state.trace, trace].slice(-80), // Keep last 80 entries
    }));
  },

  // --------------------------------------------------------------------------
  // INTERNAL: Generate final receipt
  // --------------------------------------------------------------------------
  _generateReceipt: () => {
    const state = get();
    const final = state.finalOutput;
    const comp = state.complianceResult;
    
    if (!final) return;

    const receipt: ReceiptData = {
      receiptId: final.receiptId,
      createdAt: final.timestamp,
      brief: state.brief,
      intent: state.intent,
      finalPost: final.publishedPost,
      trustScore: state.trustRuntime.intentAlignment.score,
      compliancePassed: comp?.passed ?? false,
      provenanceRoot: state.trustRuntime.provenance.rootHash,
      steps: state.stepHistory,
    };

    set({ receipt });
    
    get().addTrace({ 
      level: 'success', 
      agent: 'RECEIPT', 
      message: `Receipt ${final.receiptId} persisted` 
    });
  },

  // --------------------------------------------------------------------------
  // CRYPTOGRAPHIC TRUST RECEIPT (Web Crypto)
  // --------------------------------------------------------------------------
  generateCryptographicReceipt: async () => {
    const state = get();
    if (!state.finalOutput || !state.receipt) return;

    const verifs = [
      { name: 'Identity Verified', status: 'passed' as const, value: 'All agents verified' },
      { name: 'Authority Verified', status: 'passed' as const, value: 'All actions authorized' },
      { name: 'Intent Alignment', status: 'passed' as const, value: `${state.trustRuntime.intentAlignment.score}% Aligned` },
      { name: 'Policy Compliance', status: state.complianceResult?.passed ? ('passed' as const) : ('failed' as const), value: state.complianceResult?.passed ? 'Passed' : 'Violations' },
      { name: 'Source Grounding', status: 'passed' as const, value: '100% supported' },
      { name: 'Provenance', status: 'passed' as const, value: 'Complete' },
    ];

    const trace = state.stepHistory.map((h, i) => ({
      step: i + 1,
      agent: h.step,
      summary: (h.output as any)?.draft?.slice(0, 60) || (h.output as any)?.publishedPost?.slice(0,60) || '',
    }));

    const signed = await generateSignedReceipt({
      brief: state.brief,
      intent: state.intent,
      finalOutput: state.finalOutput.publishedPost,
      trustScore: state.trustRuntime.intentAlignment.score,
      verifications: verifs,
      executionTrace: trace,
      hashChain: state.trustRuntime.provenance.hashChain,
      provenanceRoot: state.receipt.provenanceRoot,
    });

    set({ signedReceipt: signed });
    get().addTrace({ level: 'success', agent: 'CRYPTO', message: `Signed receipt ${signed.id} (ECDSA P-256)` });
  },

  downloadSignedReceipt: () => {
    const sr = get().signedReceipt;
    if (sr) downloadReceiptJSON(sr);
  },

  verifySignedReceipt: async () => {
    const sr = get().signedReceipt;
    if (!sr) return { valid: false, message: 'No receipt to verify' };
    return await verifySignedReceipt(sr);
  },
}));

// ============================================================================
// CONSTANTS FOR STEP INDEXING
// ============================================================================

const WORKFLOW_STEPS: WorkflowStep[] = ['USER', 'PLANNER', 'WRITER', 'COMPLIANCE', 'PUBLISHER', 'OUTPUT'];

const WORKFLOW_STEP_INDEX: Record<WorkflowStep, number> = {
  IDLE: -1,
  USER: 0,
  PLANNER: 1,
  WRITER: 2,
  COMPLIANCE: 3,
  PUBLISHER: 4,
  OUTPUT: 5,
  COMPLETE: 6,
};