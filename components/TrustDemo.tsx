/**
 * Trust Receipt Demo - Main Interactive Component
 * Complete end-to-end visualization of the agentic pipeline + trust runtime
 */

'use client';

import React, { useMemo } from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, Zap, AlertTriangle, CheckCircle, 
  XCircle, User, Cpu, FileText, Shield, Send, Award, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { useTrustDemo } from '@/lib/store';
import type { WorkflowStep, DemoMode } from '@/lib/types';
import { POLICY_RULES } from '@/lib/sampleData';

// ============================================================================
// STEP CONFIG
// ============================================================================

const STEP_CONFIG: Record<Exclude<WorkflowStep, 'IDLE' | 'COMPLETE'>, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  USER: { 
    label: 'USER', 
    description: 'Upload brief & set intent', 
    icon: User, 
    color: '#8b5cf6' 
  },
  PLANNER: { 
    label: 'PLANNER', 
    description: 'Extract facts & plan', 
    icon: Cpu, 
    color: '#06b6d4' 
  },
  WRITER: { 
    label: 'WRITER', 
    description: 'Generate content draft', 
    icon: FileText, 
    color: '#f97316' 
  },
  COMPLIANCE: { 
    label: 'COMPLIANCE', 
    description: 'Policy & brand check', 
    icon: Shield, 
    color: '#ec4899' 
  },
  PUBLISHER: { 
    label: 'PUBLISHER', 
    description: 'Prepare for distribution', 
    icon: Send, 
    color: '#14b8a6' 
  },
  OUTPUT: { 
    label: 'OUTPUT', 
    description: 'Final LinkedIn post', 
    icon: Award, 
    color: '#eab308' 
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TrustDemo() {
  const store = useTrustDemo();
  
  const {
    // State
    currentStep,
    brief,
    intent,
    mode,
    userInput,
    plannerOutput,
    writerOutput,
    complianceResult,
    publisherOutput,
    finalOutput,
    trustRuntime,
    trace,
    stepHistory,
    controls,
    receipt,
    humanReviewStatus,
    
    // Actions
    setBrief,
    setIntent,
    setMode,
    runDemo,
    runHappyPath,
    triggerViolation,
    pause,
    resume,
    step: stepForward,
    reset,
    setSpeed,
    routeToHuman,
    approveHuman,
    rejectHuman,
  } = store;

  // --------------------------------------------------------------------------
  // DERIVED
  // --------------------------------------------------------------------------
  
  const isActive = (step: WorkflowStep) => currentStep === step;
  
  const getStepStatus = (step: WorkflowStep): 'pending' | 'running' | 'success' | 'failed' => {
    if (currentStep === step) return 'running';
    const hist = stepHistory.find(h => h.step === step);
    if (hist) return hist.status;
    return 'pending';
  };

  const compliancePass = complianceResult?.passed ?? null;
  const isOffPolicy = mode === 'off-policy';
  
  const canRun = !controls.isRunning && !controls.isComplete;
  const canControl = controls.isRunning || controls.isPaused;
  
  const intentScore = trustRuntime.intentAlignment.score;
  const policyScore = trustRuntime.policyCompliance.alignmentScore;
  
  // Build provenance display chain
  const provenanceDisplay = useMemo(() => {
    const chain = trustRuntime.provenance.hashChain;
    if (chain.length === 0) return ['—'];
    return chain.slice(-3); // Show last 3
  }, [trustRuntime.provenance.hashChain]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  
  const handleRunDemo = async () => {
    try {
      await runDemo();
    } catch (e) {
      toast.error('Demo run failed');
    }
  };

  const handleHappyPath = async () => {
    try {
      await runHappyPath();
      toast.success('Happy path complete — all checks passed');
    } catch (e) {
      toast.error('Run failed');
    }
  };

  const handleViolation = async () => {
    try {
      await triggerViolation();
      toast.warning('Off-policy brief triggered — compliance will fail');
    } catch (e) {
      toast.error('Run failed');
    }
  };

  const handlePauseResume = () => {
    if (controls.isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStep = async () => {
    await stepForward();
  };

  const handleReset = () => {
    reset();
    toast.info('Demo reset');
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    toast.info(`${newSpeed}× speed`);
  };

  const handleBriefChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBrief(e.target.value);
  };

  const handleRouteToHuman = () => {
    routeToHuman();
    toast('Routed to human for review', { description: 'Compliance flagged content' });
  };

  const handleHumanApprove = () => {
    approveHuman();
    toast.success('Approved by human reviewer');
  };

  const handleHumanReject = () => {
    rejectHuman();
    toast.error('Publication rejected');
  };

  // Quick load sample briefs
  const loadHappyBrief = () => {
    setMode('happy');
  };
  
  const loadOffPolicyBrief = () => {
    setMode('off-policy');
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              <div>
                <div className="font-semibold tracking-tight">Trust Receipt</div>
                <div className="text-[10px] text-zinc-500 -mt-1">LIVE DEMO ENGINE</div>
              </div>
            </div>
            <div className="ml-3 px-2 py-0.5 rounded bg-zinc-900 text-xs text-zinc-400 border border-zinc-800">
              AGI House Hackathon
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Clock className="w-3 h-3" />
            Real-time • Deterministic • Verifiable
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary Actions */}
          <button 
            onClick={handleHappyPath}
            disabled={!canRun}
            className="control-btn primary"
          >
            <Play className="w-4 h-4" /> Run Full Happy Path
          </button>
          
          <button 
            onClick={handleViolation}
            disabled={!canRun}
            className="control-btn danger"
          >
            <AlertTriangle className="w-4 h-4" /> Simulate Off-Policy Brief
          </button>

          <button 
            onClick={handleRunDemo}
            disabled={!canRun}
            className="control-btn"
          >
            <Zap className="w-4 h-4" /> Run Demo
          </button>

          {/* Simulation Controls */}
          <div className="h-6 w-px bg-zinc-800 mx-1" />
          
          <button 
            onClick={handlePauseResume}
            disabled={!canControl}
            className="control-btn"
          >
            {controls.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {controls.isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button 
            onClick={handleStep}
            disabled={controls.isRunning || controls.isComplete}
            className="control-btn"
          >
            <SkipForward className="w-4 h-4" /> Step
          </button>
          
          <button 
            onClick={handleReset}
            className="control-btn"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>

          {/* Speed */}
          <div className="flex items-center gap-1 ml-2">
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 text-xs rounded border transition-all ${
                  controls.speed === s 
                    ? 'bg-zinc-800 border-blue-500 text-blue-400' 
                    : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="ml-auto flex items-center gap-3 text-sm">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
              controls.isRunning ? 'bg-blue-950 border-blue-800 text-blue-400' :
              controls.isComplete ? 'bg-emerald-950 border-emerald-800 text-emerald-400' :
              'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}>
              {controls.isRunning ? 'RUNNING' : controls.isComplete ? 'COMPLETE' : 'READY'}
            </div>
            {isOffPolicy && (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-950 border border-red-800 text-red-400">
                OFF-POLICY MODE
              </div>
            )}
          </div>
        </div>

        {/* OFF-POLICY BANNER - Very prominent when active */}
        <AnimatePresence>
          {isOffPolicy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="off-policy-card rounded-xl border-2 border-red-600 bg-red-950/40 px-5 py-3 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <div className="font-semibold text-red-400 tracking-tight">OFF-POLICY BRIEF LOADED</div>
                <div className="text-red-300 mt-0.5">
                  This brief contains an unsupported 24-hour battery claim with no source or test data. 
                  The Compliance Agent will flag this. Expect red failure states and a "Route to Human" prompt.
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-[1px] font-mono text-red-500/70 pt-1">DEMO VIOLATION PATH</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: WORKFLOW + BRIEF INPUT */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Brief Input Card */}
            <div className="demo-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-zinc-400">INPUT • Brief & Intent</div>
                <div className="flex gap-2">
                  <button 
                    onClick={loadHappyBrief}
                    disabled={controls.isRunning}
                    className="text-xs px-2 py-1 rounded border border-zinc-800 hover:bg-zinc-900 disabled:opacity-50"
                  >
                    Load Happy Brief
                  </button>
                  <button 
                    onClick={loadOffPolicyBrief}
                    disabled={controls.isRunning}
                    className="text-xs px-2 py-1 rounded border border-zinc-800 hover:bg-zinc-900 disabled:opacity-50"
                  >
                    Load Off-Policy Brief
                  </button>
                </div>
              </div>
              
              <textarea
                value={brief}
                onChange={handleBriefChange}
                disabled={controls.isRunning}
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-mono resize-y focus:outline-none focus:border-blue-600 disabled:opacity-70"
                placeholder="Enter your content brief..."
              />
              
              <div className="mt-3">
                <div className="text-xs text-zinc-500 mb-1.5">INTENT</div>
                <input
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  disabled={controls.isRunning}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 disabled:opacity-70"
                />
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="demo-card p-5">
              <div className="text-sm font-medium text-zinc-400 mb-4">AGENT WORKFLOW</div>
              
              <div className="space-y-3">
                {(Object.keys(STEP_CONFIG) as Array<keyof typeof STEP_CONFIG>).map((stepKey, idx) => {
                  const cfg = STEP_CONFIG[stepKey];
                  const Icon = cfg.icon;
                  const status = getStepStatus(stepKey);
                  const active = isActive(stepKey);
                  
                  return (
                    <div
                      key={stepKey}
                      className={`agent-step flex gap-4 p-4 rounded-xl border transition-all ${
                        active ? 'active border-blue-500 bg-zinc-900' : 
                        status === 'success' ? 'border-emerald-800 bg-emerald-950/30' :
                        status === 'failed' ? 'border-red-800 bg-red-950/30' :
                        'border-zinc-800 bg-zinc-900/50'
                      }`}
                    >
                      {/* Step Number / Indicator */}
                      <div className="flex-shrink-0 pt-0.5">
                        <div className={`step-indicator ${
                          active ? 'active' : 
                          status === 'success' ? 'success' : 
                          status === 'failed' ? 'danger' : 'pending'
                        }`}>
                          {active ? <Icon className="w-4 h-4" /> : idx + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold tracking-tight" style={{ color: cfg.color }}>
                            {cfg.label}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {cfg.description}
                          </span>
                          {status === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        
                        {/* Step Output Previews */}
                        <div className="text-sm text-zinc-400">
                          {stepKey === 'USER' && userInput && (
                            <div className="text-emerald-400">✓ Brief locked • {userInput.brief.length} chars</div>
                          )}
                          {stepKey === 'PLANNER' && plannerOutput && (
                            <div>
                              {plannerOutput.keyFacts.length} facts • {plannerOutput.plan.length} plan steps
                              {plannerOutput.sources.length > 0 && <span className="text-amber-400"> • sources: {plannerOutput.sources.join(', ')}</span>}
                            </div>
                          )}
                          {stepKey === 'WRITER' && writerOutput && (
                            <div>{writerOutput.wordCount} words • tone: {writerOutput.tone}</div>
                          )}
                          {stepKey === 'COMPLIANCE' && complianceResult && (
                            <div className={complianceResult.passed ? 'text-emerald-400' : 'text-red-400'}>
                              {complianceResult.passed ? 'PASSED' : 'FAILED'} • {complianceResult.alignmentScore}% alignment
                            </div>
                          )}
                          {stepKey === 'PUBLISHER' && publisherOutput && (
                            <div>LinkedIn post ready • {publisherOutput.hashtags.length} hashtags</div>
                          )}
                          {stepKey === 'OUTPUT' && finalOutput && (
                            <div className="text-emerald-400">Receipt: {finalOutput.receiptId}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Agent Outputs */}
            <div className="demo-card p-5 space-y-4">
              <div className="text-sm font-medium text-zinc-400">LIVE AGENT OUTPUTS</div>
              
              {/* Writer Draft */}
              <AnimatePresence>
                {writerOutput && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-orange-900/50 bg-zinc-950 p-4"
                  >
                    <div className="text-xs uppercase tracking-widest text-orange-400 mb-2">WRITER DRAFT</div>
                    <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-zinc-300">{writerOutput.draft}</pre>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Compliance Results */}
              <AnimatePresence>
                {complianceResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border p-4 ${complianceResult.passed ? 'border-emerald-800 bg-emerald-950/20' : 'border-red-800 bg-red-950/20'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-xs uppercase tracking-widest ${complianceResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                        COMPLIANCE AGENT • {complianceResult.alignmentScore}% ALIGNMENT
                        {!complianceResult.passed && ' • STATUS NEEDS REVIEW'}
                      </div>
                      {!complianceResult.passed && humanReviewStatus === 'none' && (
                        <button 
                          onClick={handleRouteToHuman}
                          className="text-xs px-3 py-1 rounded bg-red-900/50 hover:bg-red-900 border border-red-700 text-red-300 font-medium"
                        >
                          ROUTE TO HUMAN
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      {complianceResult.reasons.map((r, i) => (
                        <div key={i} className={`policy-rule ${r.status === 'PASS' ? 'pass' : 'fail'}`}>
                          <span className="mt-0.5">{r.status === 'PASS' ? '✓' : '✗'}</span>
                          <div>
                            <div className="font-medium">{r.rule}</div>
                            <div className="text-[11px] opacity-80">{r.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Human Review UI */}
                    {humanReviewStatus !== 'none' && (
                      <div className="mt-4 pt-4 border-t border-red-800">
                        <div className="text-sm text-red-400 mb-2">HUMAN REVIEW REQUIRED</div>
                        {humanReviewStatus === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={handleHumanApprove} className="control-btn text-emerald-400 border-emerald-700 hover:bg-emerald-950">
                              <CheckCircle className="w-4 h-4" /> APPROVE
                            </button>
                            <button onClick={handleHumanReject} className="control-btn text-red-400 border-red-700 hover:bg-red-950">
                              <XCircle className="w-4 h-4" /> REJECT
                            </button>
                          </div>
                        )}
                        {humanReviewStatus === 'approved' && (
                          <div className="text-emerald-400 text-sm">✓ Approved by human reviewer. Publication allowed.</div>
                        )}
                        {humanReviewStatus === 'rejected' && (
                          <div className="text-red-400 text-sm">✗ Rejected. Publication blocked.</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Final Output */}
              <AnimatePresence>
                {finalOutput && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-yellow-800 bg-yellow-950/10 p-4"
                  >
                    <div className="text-xs uppercase tracking-widest text-yellow-400 mb-2">FINAL LINKEDIN POST</div>
                    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{finalOutput.publishedPost}</pre>
                    <div className="mt-3 pt-3 border-t border-yellow-900 text-xs text-yellow-400">
                      Receipt ID: <span className="font-mono text-yellow-300">{finalOutput.receiptId}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: TRUST RUNTIME + TRACE */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* TRUST RUNTIME PANEL */}
            <div className="demo-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-blue-400" />
                <div className="text-sm font-semibold tracking-tight">TRUST RUNTIME</div>
                <div className="text-[10px] px-1.5 py-px rounded bg-blue-950 text-blue-400 border border-blue-900">LIVE</div>
              </div>

              {/* Identity */}
              <div className="mb-4">
                <div className="text-xs text-zinc-500 mb-1">IDENTITY</div>
                <div className="text-sm">
                  <div><span className="text-zinc-400">User:</span> {trustRuntime.identity.user}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Agents: {trustRuntime.identity.agents.length} active</div>
                </div>
              </div>

              {/* Authority */}
              <div className="mb-4">
                <div className="text-xs text-zinc-500 mb-1">AUTHORITY</div>
                <div className={`inline-flex items-center gap-1 text-sm ${trustRuntime.authority.authorized ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trustRuntime.authority.authorized ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {trustRuntime.authority.role} — {trustRuntime.authority.authorized ? 'AUTHORIZED' : 'DENIED'}
                </div>
              </div>

              {/* Intent Alignment */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="text-xs text-zinc-500">INTENT ALIGNMENT</div>
                  <div className="live-number text-lg font-semibold tabular-nums text-blue-400">{intentScore}<span className="text-xs">%</span></div>
                </div>
                <div className="trust-meter mb-2">
                  <div 
                    className={`trust-meter-fill ${intentScore > 85 ? 'success' : intentScore > 70 ? 'warning' : 'danger'}`}
                    style={{ width: `${intentScore}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-500">
                  {trustRuntime.intentAlignment.matchedTerms.length > 0 && (
                    <>Matched: {trustRuntime.intentAlignment.matchedTerms.slice(0, 4).join(', ')}</>
                  )}
                  {trustRuntime.intentAlignment.driftDetected && <span className="text-amber-400"> • drift detected</span>}
                </div>
              </div>

              {/* Policy Compliance */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="text-xs text-zinc-500">POLICY COMPLIANCE</div>
                  <div className="live-number text-lg font-semibold tabular-nums text-pink-400">{policyScore}<span className="text-xs">%</span></div>
                </div>
                <div className="trust-meter mb-2">
                  <div 
                    className={`trust-meter-fill ${compliancePass === true ? 'success' : compliancePass === false ? 'danger' : 'warning'}`}
                    style={{ width: `${policyScore}%` }}
                  />
                </div>
                <div className="text-[11px]">
                  {complianceResult ? (
                    compliancePass ? 
                      <span className="text-emerald-400">All policy rules satisfied</span> : 
                      <span className="text-red-400">{complianceResult.reasons.filter(r => r.status === 'FAIL').length} violation(s)</span>
                  ) : (
                    <span className="text-zinc-500">Awaiting compliance check...</span>
                  )}
                </div>
              </div>

              {/* Provenance */}
              <div>
                <div className="text-xs text-zinc-500 mb-1.5">PROVENANCE (HASH CHAIN)</div>
                <div className="space-y-1">
                  {provenanceDisplay.map((h, i) => (
                    <div key={i} className="hash bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-[10px]">{h}</div>
                  ))}
                  {trustRuntime.provenance.stepCount > 3 && (
                    <div className="text-[10px] text-zinc-500">+{trustRuntime.provenance.stepCount - 3} more steps</div>
                  )}
                </div>
              </div>
            </div>

            {/* EXECUTION TRACE */}
            <div className="demo-card p-5 flex flex-col h-[420px]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-zinc-400">EXECUTION TRACE</div>
                <div className="text-[10px] text-zinc-500">{trace.length} events</div>
              </div>
              
              <div className="flex-1 overflow-auto trace-scroll bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono">
                {trace.length === 0 && (
                  <div className="text-zinc-600 p-2">Trace will appear here when you run the demo...</div>
                )}
                {trace.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className={`trace-entry ${entry.level}`}
                  >
                    <span className="text-zinc-500">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    {' '}<span className="text-blue-400">[{entry.agent}]</span>{' '}
                    <span className={
                      entry.level === 'success' ? 'text-emerald-400' :
                      entry.level === 'danger' ? 'text-red-400' :
                      entry.level === 'warning' ? 'text-yellow-400' : ''
                    }>{entry.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STATUS / RECEIPT CARD */}
            <AnimatePresence>
              {(controls.isComplete || receipt) && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`demo-card p-5 ${compliancePass === false && humanReviewStatus !== 'approved' ? 'danger' : 'success'}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {compliancePass === false && humanReviewStatus !== 'approved' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                    <div className="font-semibold">
                      {compliancePass === false && humanReviewStatus !== 'approved' 
                        ? 'OFF-POLICY — STATUS NEEDS REVIEW' 
                        : 'SAFE TO PUBLISH'}
                    </div>
                  </div>
                  
                  {receipt && (
                    <div className="receipt-block space-y-1 mb-3">
                      <div className="receipt-line">
                        <span className="label">Receipt ID</span>
                        <span className="value font-mono">{receipt.receiptId}</span>
                      </div>
                      <div className="receipt-line">
                        <span className="label">Trust Score</span>
                        <span className="value">{receipt.trustScore}%</span>
                      </div>
                      <div className="receipt-line">
                        <span className="label">Compliance</span>
                        <span className="value">{receipt.compliancePassed ? 'PASSED' : 'FAILED'}</span>
                      </div>
                      <div className="receipt-line">
                        <span className="label">Root Hash</span>
                        <span className="value hash">{receipt.provenanceRoot}</span>
                      </div>
                    </div>
                  )}

                  {compliancePass === false && humanReviewStatus === 'none' && (
                    <button onClick={handleRouteToHuman} className="control-btn w-full justify-center border-red-700 text-red-400">
                      ROUTE TO HUMAN REVIEW
                    </button>
                  )}
                  
                  {humanReviewStatus === 'approved' && (
                    <div className="text-emerald-400 text-sm">✓ Human approved. Ready for publication.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RECEIPT JSON — For Future Integration */}
        <AnimatePresence>
          {receipt && (
            <motion.div 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="demo-card p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-zinc-400">RECEIPT DATA (for generator integration)</div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
                    toast.success('Receipt JSON copied');
                  }}
                  className="text-xs px-2 py-1 rounded border border-zinc-700 hover:bg-zinc-900"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="receipt-block text-[11px] overflow-auto max-h-64 text-emerald-300">
{JSON.stringify(receipt, null, 2)}
              </pre>
              <div className="text-[10px] text-zinc-500 mt-2">This object is ready to be passed to a real cryptographic receipt generator.</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER / LEGEND */}
        <div className="text-[11px] text-zinc-500 flex flex-wrap gap-x-6 gap-y-1 pt-2 border-t border-zinc-800">
          <div>Policy Rules: {POLICY_RULES.length} active</div>
          <div>Identity: Hardcoded demo user (ankit@...)</div>
          <div>Provenance: SHA-inspired hash chain (demo)</div>
          <div>Intent: Keyword overlap similarity</div>
          <div className="text-zinc-600">Later: integrate with real receipt generator</div>
        </div>
      </div>
    </div>
  );
}