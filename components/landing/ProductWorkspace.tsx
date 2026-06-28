'use client';

import React, { useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
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
import type { PipelineStepStatus } from './PipelineStep';
import { ObserverAgentPanel } from './ObserverAgentPanel';
import { PublicationGate } from './PublicationGate';
import { TrustPillarsBar } from './TrustPillarsBar';
import { TrustReceiptCard } from './TrustReceiptCard';
import { WorkflowStepTimeline } from './WorkflowStepTimeline';
import { ParallelAgentFlow } from './ParallelAgentFlow';
import {
  PIPELINE_STEPS,
  STEP_ORDER,
  toParallelFlowSteps,
} from './pipelineConfig';
import {
  PipelineStep,
  resolveConnectorStatus,
} from './PipelineStep';
import { useObserverState } from '@/lib/useObserverState';

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
    stepHistory,
    humanReviewStatus,
    setBrief,
    setIntent,
    setMode,
    runDemo,
    reset,
    approveHuman,
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

  const observer = useObserverState();

  const parallelSteps = useMemo(
    () => toParallelFlowSteps(PIPELINE_STEPS, stepStatuses),
    [stepStatuses],
  );

  const observerFlowStatus: PipelineStepStatus = useMemo(() => {
    if (!hasStarted) return 'pending';
    if (observer.publicationBlocked && isComplete) return 'failed';
    if (isRunning) return 'active';
    if (isComplete) return 'done';
    return 'pending';
  }, [hasStarted, isRunning, isComplete, observer.publicationBlocked]);

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
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Workflow could not complete — check your API key or try again later.';
      toast.error(message);
    }
  }, [runDemo, generateCryptographicReceipt]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleHumanApprove = useCallback(async () => {
    approveHuman();
    await generateCryptographicReceipt();
  }, [approveHuman, generateCryptographicReceipt]);

  return (
    <section id="app" className="scroll-mt-14 border-y border-zinc-200/80 bg-white py-12 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-10 max-w-xl">
          <p className="tr-section-label">Workflow</p>
          <h2 className="tr-headline mt-2 text-2xl sm:text-3xl">
            Turn a product brief into publish-ready content
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
            Agents plan, draft, and check policy. Trust Runtime verifies every step and issues a signed receipt.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Try the sample briefs below. Live runs use Grok on the server — your API key stays in
            environment variables, never in the browser. Public demo is rate-limited per IP.
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
                  maxLength={8000}
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
                  maxLength={512}
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
                className="tr-btn-gradient w-full rounded-lg py-3 text-sm font-medium text-white disabled:opacity-60"
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

            <ObserverAgentPanel />

            <AnimatePresence>
              {hasStarted ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="space-y-4"
                >
                  <div className="tr-card space-y-4 p-5">
                    <ParallelAgentFlow
                      steps={parallelSteps}
                      observerStatus={observerFlowStatus}
                      showRuntimeBar
                    />

                    {/* Classic step strip — same PIPELINE_STEPS, compact connector view */}
                    <details className="group rounded-lg border border-zinc-100 bg-zinc-50/50">
                      <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-zinc-600 marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">Show classic step view</span>
                        <span className="hidden group-open:inline">Hide classic step view</span>
                      </summary>
                      <div
                        className="tr-pipeline-scroll flex w-full items-start overflow-x-auto border-t border-zinc-100 px-2 pb-3 pt-2"
                        role="region"
                        aria-label="Classic pipeline step view"
                      >
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
                    </details>

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
                  className="space-y-4"
                >
                  <WorkflowStepTimeline />
                  <PublicationGate onApprove={handleHumanApprove} />

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

/** Re-export canonical pipeline for consumers that imported from this module. */
export { PIPELINE_STEPS, STEP_ORDER } from './pipelineConfig';
