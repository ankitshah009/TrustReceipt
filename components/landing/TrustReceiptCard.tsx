'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import { Download, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTrustDemo } from '@/lib/store';

export const TRUST_CHECKS = [
  'Identity Verified',
  'Authority Verified',
  'Intent Alignment',
  'Policy Compliance',
  'Source Grounding',
  'Provenance Complete',
  'Human Review',
] as const;

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
    downloadSignedReceipt,
    verifySignedReceipt,
    generateCryptographicReceipt,
  } = useTrustDemo();

  const { isComplete } = controls;
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);

  const complianceFailed = complianceResult != null && !complianceResult.passed;
  const approvedDespiteFailure = humanReviewStatus === 'approved';
  const blocked = complianceFailed && !approvedDespiteFailure;
  const safeToPublish = isComplete && !blocked && humanReviewStatus !== 'rejected';

  const failureReason = useMemo(() => {
    if (!complianceResult || complianceResult.passed) return null;
    const fails = complianceResult.reasons.filter((r) => r.status === 'FAIL');
    if (fails.length === 0) return 'Policy violations recorded';
    return fails.map((r) => r.detail).join('; ');
  }, [complianceResult]);

  const checklist = useMemo(() => {
    const review = humanReviewLabel(humanReviewStatus);
    return [
      { label: 'Identity Verified', value: 'All agents verified', ok: isComplete },
      { label: 'Authority Verified', value: 'All actions authorized', ok: isComplete },
      {
        label: 'Intent Alignment',
        value: isComplete ? `${trustRuntime.intentAlignment.score}% aligned` : '—',
        ok: isComplete && trustRuntime.intentAlignment.score >= 70,
      },
      {
        label: 'Policy Compliance',
        value:
          !complianceResult
            ? '—'
            : complianceResult.passed || approvedDespiteFailure
              ? 'Passed'
              : 'Failed',
        ok: complianceResult?.passed === true || approvedDespiteFailure,
      },
      { label: 'Source Grounding', value: '100% supported', ok: isComplete && !blocked },
      {
        label: 'Provenance Complete',
        value: isComplete ? 'Hash chain intact' : '—',
        ok: isComplete,
      },
      { label: 'Human Review', value: review.text, ok: review.ok },
    ];
  }, [
    isComplete,
    trustRuntime.intentAlignment.score,
    complianceResult,
    approvedDespiteFailure,
    blocked,
    humanReviewStatus,
  ]);

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
      <div className="tr-receipt-card rounded-2xl overflow-hidden">
        <div className="tr-card-header px-5 py-4">
          <h3 className="text-[15px] font-semibold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
            Trust Receipt
          </h3>
        </div>
        <div className="px-5 pb-8 pt-2 flex flex-col items-center justify-center text-center min-h-[340px]">
          <div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-400 max-w-[260px] leading-relaxed">
            Complete a workflow to issue a Trust Receipt
          </p>
          <p className="text-[11px] text-slate-600 mt-2 max-w-[240px]">
            Cryptographically signed proof of every agent step
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tr-receipt-card rounded-2xl overflow-hidden">
      <div className="tr-card-header px-5 py-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-300" strokeWidth={1.75} />
            Trust Receipt
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-mono tracking-tight">
            ECDSA P-256 · client-side verify
          </p>
        </div>
        <span className="font-mono text-[10px] text-slate-500 shrink-0 pt-0.5 tabular-nums">
          {signedReceipt?.id || receipt?.receiptId}
        </span>
      </div>

      <div className="px-5 pb-5">
        <div className="mb-5">
          {safeToPublish ? (
            <div className="inline-flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-500/90">
                Publication status
              </span>
              <span className="text-base font-semibold tracking-tight text-emerald-400">
                Safe to publish
              </span>
            </div>
          ) : (
            <div className="inline-flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-amber-500/80">
                Publication status
              </span>
              <span className="text-base font-semibold tracking-tight text-amber-200">
                Needs review
              </span>
            </div>
          )}
        </div>

        {!safeToPublish && failureReason && (
          <p className="text-xs text-slate-400 mb-4 leading-relaxed border-l-2 border-amber-500/40 pl-3">
            {failureReason}
          </p>
        )}

        <div className="tr-card-inner rounded-xl p-1 space-y-px">
          {checklist.map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-2.5 px-3 gap-3 rounded-lg hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-[12px] text-slate-500 shrink-0">{row.label}</span>
              <span
                className={`font-mono text-[11px] text-right truncate tabular-nums ${
                  row.ok ? 'text-emerald-400/90' : 'text-slate-500'
                }`}
              >
                {row.ok ? '✓' : '○'} {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-lg border border-white/[0.1] text-slate-300 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
            Download JSON
          </button>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          className="mt-3 w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
        >
          {isVerifying ? 'Verifying…' : 'Verify integrity'}
        </button>

        {verifyResult && (
          <div
            className={`mt-3 text-xs p-3 rounded-lg font-mono ${
              verifyResult.valid
                ? 'bg-emerald-500/[0.08] text-emerald-400/90 border border-emerald-500/20'
                : 'bg-red-500/[0.08] text-red-400/90 border border-red-500/20'
            }`}
          >
            {verifyResult.message}
          </div>
        )}
      </div>
    </div>
  );
}

export const TrustReceiptCard = memo(TrustReceiptCardComponent);
