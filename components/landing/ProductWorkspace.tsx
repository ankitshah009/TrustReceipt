'use client';

import React, { useCallback, useMemo } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Play,
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
    <section id="app" className="scroll-mt-20 border-y border-slate-200/60 bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          {/* Left column — workflow input & progress */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Your workflow
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1.5">
                Turn a product brief into publish-ready content
              </h2>
              <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
                Product brief to LinkedIn post — every agent step verified and signed.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Product brief</span>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  disabled={isRunning}
                  rows={4}
                  className="mt-1.5 w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/25 disabled:opacity-60 resize-y bg-white"
                  placeholder="Describe what you want the agents to create…"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-400">Intent</span>
                <input
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  disabled={isRunning}
                  className="mt-1 w-full text-sm border border-slate-100 rounded-lg px-3 py-2 text-slate-600 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 disabled:opacity-60"
                  placeholder="What outcome should this content achieve?"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={loadCompliantExample}
                  disabled={isRunning}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Compliant brief
                </button>
                <button
                  type="button"
                  onClick={loadRiskyExample}
                  disabled={isRunning}
                  className="text-xs px-3 py-1.5 rounded-full border border-red-200/80 text-red-600 hover:bg-red-50/80 disabled:opacity-50 transition-colors"
                >
                  Policy violation test
                </button>
              </div>

              <button
                type="button"
                onClick={handleRun}
                disabled={isRunning || !brief.trim()}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-[#2563eb] hover:bg-[#1e4fc0] text-white rounded-xl disabled:opacity-60 transition-colors shadow-sm shadow-[#2563eb]/20"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running workflow…
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run workflow
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {hasStarted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] space-y-5"
                >
                  <div className="flex w-full items-start overflow-x-auto pb-1 -mx-1 px-1">
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
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-2">
                      Trust runtime
                    </p>
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
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {blocked ? (
                    <div className="rounded-2xl border border-red-200/80 bg-red-50/50 p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-red-900">Needs review</p>
                          <p className="text-sm text-red-800/90 mt-1 leading-relaxed">
                            Compliance flagged unsupported or unsourced claims before publication.
                          </p>
                          {complianceResult && (
                            <ul className="mt-3 space-y-1.5 text-sm text-red-800">
                              {complianceResult.reasons
                                .filter((r) => r.status === 'FAIL')
                                .map((r, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="text-red-500 shrink-0">✗</span>
                                    <span>
                                      <span className="font-medium">{r.rule}</span>
                                      {' — '}
                                      {r.detail}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          )}
                          {writerOutput && (
                            <div className="mt-4 p-3 bg-white/70 rounded-xl border border-red-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {writerOutput.draft}
                            </div>
                          )}
                          {humanReviewStatus === 'none' && (
                            <button
                              type="button"
                              onClick={routeToHuman}
                              className="mt-4 text-sm px-4 py-2 bg-white border border-red-200 rounded-xl hover:bg-red-50/80 transition-colors text-red-900"
                            >
                              Route to human reviewer
                            </button>
                          )}
                          {humanReviewStatus === 'pending' && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={handleHumanApprove}
                                className="text-sm px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                              >
                                Approve override
                              </button>
                              <button
                                type="button"
                                onClick={rejectHuman}
                                className="text-sm px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {humanReviewStatus === 'rejected' && (
                            <p className="mt-3 text-sm text-red-800 font-medium">
                              Publication rejected by reviewer.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03]">
                      <div className="flex items-center gap-2 text-slate-900 text-sm font-semibold mb-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Safe to publish
                      </div>
                      {publishedPost && (
                        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-3">
                          {publishedPost}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Start over
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column — sticky Trust Receipt */}
          <div className="lg:sticky lg:top-24">
            <TrustReceiptCard />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductWorkspace;
