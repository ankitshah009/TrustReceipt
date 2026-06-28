'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import { Download, Share2, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTrustDemo } from '@/lib/store';
import { useObserverState } from '@/lib/useObserverState';
import { TrustMetricsGrid, type TrustMetric } from './TrustMetricsGrid';
import { ExecutionTrace, type TraceStep } from './ExecutionTrace';
import { PIPELINE_STEPS } from './pipelineConfig';
import type { PipelineStepStatus } from './PipelineStep';

type HumanReviewLabel = 'none' | 'pending' | 'approved' | 'rejected';

function humanReviewLabel(status: HumanReviewLabel): { text: string; ok: boolean } {
  switch (status) {
    case 'none':
      return { text: 'Not required', ok: true };
    case 'pending':
      return { text: 'Awaiting reviewer', ok: false };
    case 'approved':
      return { text: 'Approved override', ok: true };
    case 'rejected':
      return { text: 'Rejected', ok: false };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function TrustReceiptCardComponent() {
  const {
    controls,
    trustRuntime,
    complianceResult,
    signedReceipt,
    receipt,
    humanReviewStatus,
    stepHistory,
    currentStep,
    downloadSignedReceipt,
    verifySignedReceipt,
    generateCryptographicReceipt,
  } = useTrustDemo();

  const observer = useObserverState();
  const { isRunning, isComplete } = controls;
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);

  const complianceFailed = complianceResult != null && !complianceResult.passed;
  const approvedDespiteFailure = humanReviewStatus === 'approved';
  const blocked =
    observer.publicationBlocked || (complianceFailed && !approvedDespiteFailure);
  const safeToPublish = isComplete && !blocked && humanReviewStatus !== 'rejected';

  const failureReason = useMemo(() => {
    if (!complianceResult || complianceResult.passed) return null;
    const fails = complianceResult.reasons.filter((r) => r.status === 'FAIL');
    if (fails.length === 0) return 'Policy violations recorded';
    return fails.map((r) => r.detail).join('; ');
  }, [complianceResult]);

  const metrics: TrustMetric[] = useMemo(() => {
    const review = humanReviewLabel(humanReviewStatus);
    const policyOk = complianceResult?.passed === true || approvedDespiteFailure;
    return [
      {
        key: 'identity',
        label: 'Identity',
        status: isComplete ? 'Verified' : '—',
        detail: isComplete ? '4 agents verified' : 'Awaiting run',
        ok: isComplete,
      },
      {
        key: 'authority',
        label: 'Authority',
        status: isComplete ? 'Verified' : '—',
        detail: isComplete ? 'Within scope' : 'Awaiting run',
        ok: isComplete,
      },
      {
        key: 'intent',
        label: 'Intent',
        status: isComplete ? `${trustRuntime.intentAlignment.score}%` : '—',
        detail: isComplete ? 'Aligned to brief' : 'Awaiting run',
        ok: isComplete && trustRuntime.intentAlignment.score >= 70,
      },
      {
        key: 'policy',
        label: 'Policy',
        status: !complianceResult ? '—' : policyOk ? 'Passed' : 'Failed',
        detail:
          humanReviewStatus !== 'none'
            ? review.text
            : policyOk
              ? 'No violations'
              : 'Review required',
        ok: policyOk,
      },
      {
        key: 'provenance',
        label: 'Provenance',
        status: isComplete ? '100%' : '—',
        detail: isComplete ? 'Fully grounded' : 'Building',
        ok: isComplete && !blocked,
      },
    ].filter(Boolean) as TrustMetric[];
  }, [
    isComplete,
    trustRuntime.intentAlignment.score,
    complianceResult,
    approvedDespiteFailure,
    blocked,
    humanReviewStatus,
  ]);

  const traceSteps: TraceStep[] = useMemo(() => {
    return PIPELINE_STEPS.map((step) => {
      const hist = stepHistory.find((h) => h.step === step.key);
      let status: PipelineStepStatus = 'pending';
      if (hist?.status === 'failed') status = 'failed';
      else if (hist?.status === 'success') status = 'done';
      else if (currentStep === step.key && isRunning) status = 'active';
      // Do not force 'done' on isComplete alone; derive strictly from stepHistory
      // so the receipt trace reflects actual execution, not derived completion flag.
      return { key: step.key, label: step.label, status };
    });
  }, [stepHistory, currentStep, isRunning, isComplete]);

  const receiptId = signedReceipt?.id || receipt?.receiptId || 'tr_pending…';
  const issuedAt = signedReceipt?.timestamp ?? receipt?.createdAt;

  const handleDownload = useCallback(() => {
    if (signedReceipt) {
      downloadSignedReceipt();
    } else if (receipt) {
      const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${receipt.receiptId}-receipt.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success('Receipt saved to downloads');
  }, [signedReceipt, receipt, downloadSignedReceipt]);

  const handleShare = useCallback(async () => {
    const payload = signedReceipt ?? receipt;
    if (!payload) {
      toast.error('Complete a workflow to share a receipt');
      return;
    }
    const text = JSON.stringify(payload, null, 2);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Trust Receipt',
          text: `Trust Receipt ${receiptId}`,
        });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    await navigator.clipboard.writeText(text);
    toast.success('Receipt JSON copied to clipboard');
  }, [signedReceipt, receipt, receiptId]);

  const handleVerify = useCallback(async () => {
    setIsVerifying(true);
    try {
      if (!signedReceipt) {
        await generateCryptographicReceipt();
      }
      const result = await verifySignedReceipt();
      setVerifyResult(result);
      if (result.valid) {
        toast.success('Signature valid — receipt integrity confirmed');
      } else {
        toast.error('Integrity check failed — receipt could not be verified');
      }
    } finally {
      setIsVerifying(false);
    }
  }, [signedReceipt, generateCryptographicReceipt, verifySignedReceipt]);

  if (!isComplete) {
    return (
      <div className="tr-receipt-card tr-receipt-tear rounded-2xl overflow-hidden">
        <div className="tr-card-header flex items-center justify-between px-4 py-3 sm:px-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Shield className="h-4 w-4 text-violet-400" strokeWidth={1.75} />
            Trust Receipt
          </h3>
          <span className="font-mono text-[10px] text-slate-500">pending</span>
        </div>
        <div className="flex min-h-[300px] flex-col items-center justify-center px-5 pb-10 pt-4 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/20">
            <Shield className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
          </div>
          <p className="max-w-[260px] text-sm leading-relaxed text-slate-400">
            Run the workflow — agents execute in parallel with the Observer while Trust Runtime
            scores every step.
          </p>
          <p className="mt-2 text-[11px] text-slate-600">ECDSA P-256 · offline verification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tr-receipt-card tr-receipt-tear rounded-2xl overflow-hidden">
      <div className="tr-card-header relative px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-2 pr-28 sm:flex-row sm:items-start sm:justify-between sm:pr-36">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
              <ShieldCheck className="h-4 w-4 text-violet-300" strokeWidth={1.75} />
              Trust Receipt
            </h3>
            <p className="mt-1 font-mono text-[10px] text-slate-500">{receiptId}</p>
            {issuedAt ? (
              <p className="mt-0.5 text-[10px] text-slate-600">
                Issued {new Date(issuedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>
        <div
          className={`absolute right-4 top-3 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] sm:right-5 ${
            safeToPublish
              ? 'safe-banner'
              : 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
          }`}
        >
          {safeToPublish ? 'Safe to publish' : observer.publicationBlocked ? 'Blocked' : 'Review'}
        </div>
      </div>

      <div className="px-4 pb-5 sm:px-5">
        {!safeToPublish && failureReason ? (
          <p className="mb-4 border-l-2 border-amber-500/50 pl-3 text-xs leading-relaxed text-slate-400">
            {failureReason}
          </p>
        ) : null}

        <TrustMetricsGrid metrics={metrics} variant="dark" />
        <ExecutionTrace steps={traceSteps} />

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="tr-receipt-action flex items-center justify-center gap-1.5 py-2.5 text-xs"
          >
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Share receipt
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="tr-receipt-action flex items-center justify-center gap-1.5 py-2.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Download JSON
          </button>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          className="mt-3 w-full text-center text-[11px] text-slate-500 transition-colors hover:text-violet-300 disabled:opacity-50"
        >
          {isVerifying ? 'Verifying…' : 'Verify integrity offline'}
        </button>

        {verifyResult ? (
          <div
            className={`mt-3 rounded-lg p-3 font-mono text-xs ${
              verifyResult.valid
                ? 'border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400/90'
                : 'border border-red-500/20 bg-red-500/[0.08] text-red-400/90'
            }`}
          >
            {verifyResult.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const TrustReceiptCard = memo(TrustReceiptCardComponent);
