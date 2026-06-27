'use client';

import React, { useCallback, useMemo } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Send,
  Shield,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTrustDemo } from '@/lib/store';
import {
  HAPPY_BRIEF,
  HAPPY_INTENT,
  OFF_POLICY_BRIEF,
  OFF_POLICY_INTENT,
} from '@/lib/sampleData';
import type { WorkflowStep } from '@/lib/types';
import {
  PipelineStep,
  resolveConnectorStatus,
  type PipelineStepConfig,
  type PipelineStepStatus,
} from './PipelineStep';
import { TrustPillarsBar } from './TrustPillarsBar';
import { TrustReceiptCard } from './TrustReceiptCard';

export const PIPELINE_STEPS: PipelineStepConfig[] = [
  { key: 'USER', label: 'User', icon: User, description: 'Intent captured' },
  { key: 'PLANNER', label: 'Planner', icon: Bot, description: 'Facts & plan' },
  { key: 'WRITER', label: 'Writer', icon: Pencil, description: 'Draft content' },
  { key: 'COMPLIANCE', label: 'Compliance', icon: Shield, description: 'Policy check' },
  { key: 'PUBLISHER', label: 'Publisher', icon: Send, description: 'Format output' },
  { key: 'OUTPUT', label: 'Output', icon: FileText, description: 'Final post' },
];

const STEP_ORDER = PIPELINE_STEPS.map((s) => s.key);

function resolveStepStatus(
  stepKey: string,
  idx: number,
  ctx: {
    currentStep: WorkflowStep;
    isRunning: boolean;
    isComplete: boolean;
    liveStepIdx: number;
    complianceFailed: boolean;
    stepHistory: { step: WorkflowStep; status: string }[];
  },
): PipelineStepStatus {
  const hist = ctx.stepHistory.find((h) => h.step === stepKey);
  if (hist?.status === 'failed') return 'failed';
  if (stepKey === 'COMPLIANCE' && ctx.complianceFailed && ctx.isComplete) return 'failed';
  if (hist?.status === 'success') return 'done';
  if (ctx.currentStep === stepKey && ctx.isRunning) return 'active';
  if (ctx.isComplete || idx < ctx.liveStepIdx) return 'done';
  return 'pending';
}

export function ProductWorkspace() {
  const {
    brief,
    intent,
    currentStep,
    controls,
    trustRuntime,
    complianceResult,
    writerOutput,
    finalOutput,
    stepHistory,
    humanReviewStatus,
    setBrief,
    setIntent,
    setMode,
    runDemo,
    reset,
    routeToHuman,
    approveHuman,
    rejectHuman,
    generateCryptographicReceipt,
  } = useTrustDemo();

  const { isRunning, isComplete } = controls;
  const hasStarted = isRunning || isComplete || currentStep !== 'IDLE';

  const liveStepIdx = STEP_ORDER.indexOf(
    (currentStep === 'IDLE' || currentStep === 'COMPLETE'
      ? isComplete
        ? 'OUTPUT'
        : 'IDLE'
      : currentStep) as (typeof STEP_ORDER)[number],
  );

  const complianceFailed = complianceResult != null && !complianceResult.passed;
  const approvedDespiteFailure = humanReviewStatus === 'approved';
  const blocked = useMemo(
    () => complianceFailed && !approvedDespiteFailure,
    [complianceFailed, approvedDespiteFailure],
  );

  const publishedPost = useMemo(
    () => finalOutput?.publishedPost ?? writerOutput?.draft ?? null,
    [finalOutput, writerOutput],
  );

  const stepStatuses = useMemo(
    () =>
      PIPELINE_STEPS.map((step, idx) =>
        resolveStepStatus(step.key, idx, {
          currentStep,
          isRunning,
          isComplete,
          liveStepIdx,
          complianceFailed,
          stepHistory,
        }),
      ),
    [currentStep, isRunning, isComplete, liveStepIdx, complianceFailed, stepHistory],
  );

  const loadCompliantExample = useCallback(() => {
    setMode('happy');
    setBrief(HAPPY_BRIEF);
    setIntent(HAPPY_INTENT);
  }, [setMode, setBrief, setIntent]);

  const loadRiskyExample = useCallback(() => {
    setMode('off-policy');
    setBrief(OFF_POLICY_BRIEF);
    setIntent(OFF_POLICY_INTENT);
  }, [setMode, setBrief, setIntent]);

  const handleRun = useCallback(async () => {
    try {
      await runDemo();
      await generateCryptographicReceipt();
    } catch {
      toast.error('Workflow could not complete — check your API key in .env.local');
    }
  }, [runDemo, generateCryptographicReceipt]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleHumanApprove = useCallback(async () => {
    approveHuman();
    await generateCryptographicReceipt();
    toast.success('Review approved — receipt updated');
  }, [approveHuman, generateCryptographicReceipt]);

  return (
    <section id="app" className="scroll-mt-14 border-y border-zinc-200/80 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-10 max-w-xl">
          <p className="tr-section-label">Workflow</p>
          <h2 className="tr-headline mt-2 text-2xl sm:text-3xl">
            Turn a product brief into publish-ready content
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
            Agents plan, draft, and check policy. Trust Runtime verifies every step and issues a signed receipt.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-5">
            <div className="tr-card p-5 sm:p-6 space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-zinc-500">Product brief</span>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  disabled={isRunning}
                  rows={4}
                  className="mt-1.5 w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
                  placeholder="Create a LinkedIn launch post from this product brief. Only use approved claims."
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-400">Intent</span>
                <input
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  disabled={isRunning}
                  className="mt-1 w-full rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-600/15 disabled:opacity-60"
                  placeholder="What outcome should this content achieve?"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadCompliantExample}
                  disabled={isRunning}
                  className="tr-btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Compliant brief
                </button>
                <button
                  type="button"
                  onClick={loadRiskyExample}
                  disabled={isRunning}
                  className="rounded-md border border-red-200/90 px-3 py-1.5 text-xs text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Policy violation test
                </button>
              </div>

              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning || !brief.trim()}
                className="tr-btn-primary w-full py-3 disabled:opacity-60"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running workflow…
                  </>
                ) : (
                  'Run workflow'
                )}
              </button>
            </div>

            <AnimatePresence>
              {hasStarted ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="tr-card p-5 space-y-5"
                >
                  <div className="flex w-full items-start overflow-x-auto pb-1">
                    {PIPELINE_STEPS.map((step, idx) => (
                      <PipelineStep
                        key={step.key}
                        step={step}
                        status={stepStatuses[idx]}
                        showConnector={idx < PIPELINE_STEPS.length - 1}
                        connectorStatus={resolveConnectorStatus(
                          stepStatuses[idx],
                          stepStatuses[idx + 1],
                        )}
                      />
                    ))}
                  </div>

                  <div>
                    <p className="tr-section-label mb-2">Trust runtime</p>
                    <TrustPillarsBar
                      hasStarted={hasStarted}
                      isRunning={isRunning}
                      isComplete={isComplete}
                      liveStepIdx={liveStepIdx}
                      trustRuntime={trustRuntime}
                      complianceResult={complianceResult}
                      approvedDespiteFailure={approvedDespiteFailure}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {isComplete ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {blocked ? (
                    <div className="rounded-xl border border-red-200/90 bg-red-50/40 p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-red-950">Needs review</p>
                          <p className="mt-1 text-sm leading-relaxed text-red-900/90">
                            Unsupported or unsourced claims were flagged before publication.
                          </p>
                          {complianceResult ? (
                            <ul className="mt-3 space-y-1.5 text-sm text-red-900">
                              {complianceResult.reasons
                                .filter((r) => r.status === 'FAIL')
                                .map((r, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="shrink-0 text-red-500">✗</span>
                                    <span>
                                      <span className="font-medium">{r.rule}</span>
                                      {' — '}
                                      {r.detail}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          ) : null}
                          {writerOutput ? (
                            <div className="mt-4 whitespace-pre-wrap rounded-lg border border-red-100 bg-white/80 p-3 text-sm leading-relaxed text-zinc-700">
                              {writerOutput.draft}
                            </div>
                          ) : null}
                          {humanReviewStatus === 'none' ? (
                            <button
                              type="button"
                              onClick={routeToHuman}
                              className="tr-btn-secondary mt-4 border-red-200 text-red-900 hover:bg-red-50"
                            >
                              Route to human reviewer
                            </button>
                          ) : null}
                          {humanReviewStatus === 'pending' ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={handleHumanApprove}
                                className="tr-btn-primary px-4 py-2 text-sm"
                              >
                                Approve override
                              </button>
                              <button
                                type="button"
                                onClick={rejectHuman}
                                className="tr-btn-secondary px-4 py-2 text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          ) : null}
                          {humanReviewStatus === 'rejected' ? (
                            <p className="mt-3 text-sm font-medium text-red-900">
                              Publication rejected by reviewer.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="tr-card p-5">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-950">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Safe to publish
                      </div>
                      {publishedPost ? (
                        <div className="whitespace-pre-wrap border-t border-zinc-100 pt-3 text-sm leading-relaxed text-zinc-700">
                          {publishedPost}
                        </div>
                      ) : null}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    Start over
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="lg:sticky lg:top-20">
            <TrustReceiptCard />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductWorkspace;
