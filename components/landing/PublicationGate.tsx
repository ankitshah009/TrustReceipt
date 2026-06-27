'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { ObserverState } from '@/lib/observer/types';
import { extractHourClaims } from '@/lib/observer/deriveObserverState';
import { useObserverState } from '@/lib/useObserverState';
import { useTrustDemo } from '@/lib/store';

interface PublicationGateProps {
  observer?: ObserverState;
  onApprove?: () => void;
}

function PublicationGateComponent({ observer: observerProp, onApprove }: PublicationGateProps) {
  const derivedObserver = useObserverState();
  const {
    brief,
    writerOutput,
    finalOutput,
    humanReviewStatus,
    complianceResult,
    routeToHuman,
    approveHuman,
    rejectHuman,
    generateCryptographicReceipt,
  } = useTrustDemo();

  const observer = observerProp ?? derivedObserver;
  const generatedText = finalOutput?.publishedPost ?? writerOutput?.draft ?? null;
  const hourClaims = useMemo(
    () => extractHourClaims(brief, generatedText),
    [brief, generatedText],
  );

  const publicationBlocked = observer.publicationBlocked;
  const showOffPolicy = publicationBlocked;
  const showOnPolicy = !publicationBlocked;

  const handleApprove = useCallback(async () => {
    approveHuman();
    await generateCryptographicReceipt();
    onApprove?.();
    toast.success('Review approved — publication cleared');
  }, [approveHuman, generateCryptographicReceipt, onApprove]);

  const handleRoute = useCallback(() => {
    routeToHuman();
    toast.message('Routed to human reviewer');
  }, [routeToHuman]);

  const handleReject = useCallback(() => {
    rejectHuman();
    toast.error('Publication rejected');
  }, [rejectHuman]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <article
        className={`tr-card overflow-hidden transition-opacity ${
          showOffPolicy ? 'ring-2 ring-amber-400/40 opacity-100' : 'opacity-40 pointer-events-none'
        }`}
        aria-hidden={!showOffPolicy}
      >
        <div className="border-b border-red-200/60 bg-gradient-to-br from-red-50/80 to-amber-50/60 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-700" strokeWidth={1.75} />
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-red-900">
              Off-policy output detected
            </p>
          </div>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="tr-card-inset p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Brief claim</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900">
                {hourClaims.briefHours != null ? `${hourClaims.briefHours}h` : '—'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 line-clamp-3">{brief}</p>
            </div>
            <div className="tr-card-inset border-red-100 bg-red-50/40 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-red-700/80">Generated claim</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-red-900">
                {hourClaims.generatedHours != null ? `${hourClaims.generatedHours}h` : '—'}
              </p>
              {generatedText ? (
                <p className="mt-1 text-xs leading-relaxed text-red-950/80 line-clamp-3">{generatedText}</p>
              ) : null}
            </div>
          </div>

          {hourClaims.briefHours != null &&
          hourClaims.generatedHours != null &&
          hourClaims.generatedHours > hourClaims.briefHours ? (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              Output exceeds sourced performance data in the brief
            </div>
          ) : null}

          <p className="text-sm leading-relaxed text-zinc-700">
            {observer.blockReason ??
              complianceResult?.reasons.find((r) => r.status === 'FAIL')?.detail ??
              'Unsupported claims flagged before publication.'}
          </p>

          <p className="text-xs font-medium text-amber-900/90">Routed to human for approval</p>

          {humanReviewStatus === 'none' ? (
            <button type="button" onClick={handleRoute} className="tr-btn-secondary w-full text-sm">
              Route to human reviewer
            </button>
          ) : null}

          {humanReviewStatus === 'pending' ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleApprove} className="tr-btn-primary flex-1 py-2.5 text-sm">
                Approve override
              </button>
              <button type="button" onClick={handleReject} className="tr-btn-secondary flex-1 py-2.5 text-sm">
                Reject
              </button>
            </div>
          ) : null}

          {humanReviewStatus === 'rejected' ? (
            <p className="text-sm font-medium text-red-900">Publication rejected by reviewer.</p>
          ) : null}

          {humanReviewStatus === 'approved' ? (
            <p className="text-sm font-medium text-emerald-800">Human override approved — clearing gate.</p>
          ) : null}
        </div>
      </article>

      <article
        className={`tr-card overflow-hidden transition-opacity ${
          showOnPolicy ? 'ring-2 ring-emerald-400/35 opacity-100' : 'opacity-40 pointer-events-none'
        }`}
        aria-hidden={!showOnPolicy}
      >
        <div className="border-b border-emerald-200/60 bg-gradient-to-br from-emerald-50/90 to-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-900">
              On-policy output
            </p>
          </div>
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="tr-card-inset p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Brief claim</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900">
                {hourClaims.briefHours != null ? `${hourClaims.briefHours}h` : '—'}
              </p>
            </div>
            <div className="tr-card-inset border-emerald-100 bg-emerald-50/40 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-800/80">
                Generated claim
              </p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-emerald-900">
                {hourClaims.generatedHours != null ? `${hourClaims.generatedHours}h` : '—'}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-zinc-700">
            All performance claims are supported by the brief and policy rules. Safe to publish without
            human intervention.
          </p>

          {generatedText ? (
            <div className="tr-card-inset max-h-40 overflow-y-auto whitespace-pre-wrap p-3 text-sm leading-relaxed text-zinc-700">
              {generatedText}
            </div>
          ) : null}

          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
            <CheckCircle2 className="h-4 w-4" />
            Cleared for publication
          </div>
        </div>
      </article>
    </div>
  );
}

export const PublicationGate = memo(PublicationGateComponent);
