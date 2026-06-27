/**
 * Trust Receipt Demo - Core Type Definitions
 * End-to-end agentic content pipeline with real-time trust runtime verification
 */

// ============================================================================
// WORKFLOW STEPS
// ============================================================================

export type WorkflowStep = 
  | 'IDLE'
  | 'USER'
  | 'PLANNER'
  | 'WRITER'
  | 'COMPLIANCE'
  | 'PUBLISHER'
  | 'OUTPUT'
  | 'COMPLETE';

export const WORKFLOW_STEPS: Exclude<WorkflowStep, 'IDLE' | 'COMPLETE'>[] = [
  'USER',
  'PLANNER',
  'WRITER',
  'COMPLIANCE',
  'PUBLISHER',
  'OUTPUT',
];

export interface StepConfig {
  id: WorkflowStep;
  label: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================================================
// AGENT OUTPUTS
// ============================================================================

export interface UserInput {
  brief: string;
  intent: string;
  timestamp: string;
}

export interface PlannerOutput {
  keyFacts: string[];
  plan: string[];
  estimatedClaims: string[];
  sources: string[];
  timestamp: string;
}

export interface WriterOutput {
  draft: string;
  wordCount: number;
  tone: string;
  claims: string[];
  timestamp: string;
}

export interface ComplianceResult {
  passed: boolean;
  alignmentScore: number; // 0-100
  reasons: ComplianceReason[];
  policyChecks: PolicyCheck[];
  timestamp: string;
}

export interface ComplianceReason {
  rule: string;
  status: 'PASS' | 'FAIL';
  detail: string;
}

export interface PolicyCheck {
  ruleId: string;
  rule: string;
  passed: boolean;
  detail: string;
}

export interface PublisherOutput {
  linkedInPost: string;
  hashtags: string[];
  callToAction: string;
  timestamp: string;
}

export interface FinalOutput {
  publishedPost: string;
  receiptId: string;
  timestamp: string;
}

// ============================================================================
// TRUST RUNTIME (runs continuously in parallel)
// ============================================================================

export interface Identity {
  user: string;
  agents: string[];
  sessionId: string;
}

export interface Authority {
  authorized: boolean;
  role: string;
  permissions: string[];
  checkedAt: string;
}

export interface IntentAlignment {
  score: number; // 0-100, live updating
  keywords: string[];
  matchedTerms: string[];
  driftDetected: boolean;
  lastComputed: string;
}

export interface PolicyCompliance {
  overallPass: boolean;
  alignmentScore: number;
  violations: string[];
  lastChecked: string;
}

export interface Provenance {
  hashChain: string[]; // SHA-like hashes of each step output
  stepCount: number;
  rootHash: string;
}

export interface TrustRuntimeState {
  identity: Identity;
  authority: Authority;
  intentAlignment: IntentAlignment;
  policyCompliance: PolicyCompliance;
  provenance: Provenance;
}

// ============================================================================
// EXECUTION TRACE
// ============================================================================

export type TraceLevel = 'info' | 'success' | 'warning' | 'danger';

export interface TraceEntry {
  id: string;
  timestamp: string;
  level: TraceLevel;
  agent: string;
  message: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// STEP HISTORY
// ============================================================================

export interface StepHistoryEntry {
  step: WorkflowStep;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime?: string;
  endTime?: string;
  output?: unknown;
  duration?: number;
}

// ============================================================================
// DEMO MODE & STATE
// ============================================================================

export type DemoMode = 'happy' | 'off-policy';

export interface ReceiptData {
  receiptId: string;
  createdAt: string;
  brief: string;
  intent: string;
  finalPost: string;
  trustScore: number;
  compliancePassed: boolean;
  provenanceRoot: string;
  steps: StepHistoryEntry[];
}

// ============================================================================
// SIMULATION CONTROLS
// ============================================================================

export interface SimulationControls {
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  speed: number; // 1x, 2x, 0.5x etc
  currentStepIndex: number;
  mode: DemoMode;
}

// ============================================================================
// MAIN STORE STATE
// ============================================================================

export interface TrustDemoState {
  // Current workflow
  currentStep: WorkflowStep;
  brief: string;
  intent: string;
  
  // Mode
  mode: DemoMode;
  
  // Step outputs
  userInput: UserInput | null;
  plannerOutput: PlannerOutput | null;
  writerOutput: WriterOutput | null;
  complianceResult: ComplianceResult | null;
  publisherOutput: PublisherOutput | null;
  finalOutput: FinalOutput | null;
  
  // Trust runtime (live)
  trustRuntime: TrustRuntimeState;
  
  // Execution trace
  trace: TraceEntry[];
  
  // Step history for receipt
  stepHistory: StepHistoryEntry[];
  
  // Controls
  controls: SimulationControls;
  
  // Final receipt
  receipt: ReceiptData | null;

  // Cryptographic signed receipt
  signedReceipt: import('./receipt').SignedTrustReceipt | null;
  
  // Human review state (for off-policy)
  humanReviewStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

// ============================================================================
// ACTIONS
// ============================================================================

export interface TrustDemoActions {
  // Input
  setBrief: (brief: string) => void;
  setIntent: (intent: string) => void;
  
  // Demo control
  setMode: (mode: DemoMode) => void;
  runDemo: () => Promise<void>;
  runHappyPath: () => Promise<void>;
  triggerViolation: () => Promise<void>;
  
  // Simulation controls
  pause: () => void;
  resume: () => void;
  step: () => Promise<void>;
  reset: () => void;
  setSpeed: (speed: number) => void;
  
  // Human review (off-policy)
  routeToHuman: () => void;
  approveHuman: () => void;
  rejectHuman: () => void;
  
  // Internal simulation
  executeStep: (step: WorkflowStep) => Promise<void>;
  addTrace: (entry: Omit<TraceEntry, 'id' | 'timestamp'>) => void;
  updateTrustRuntime: (partial: Partial<TrustRuntimeState>) => void;
  computeIntentAlignment: () => void;
  generateProvenanceHash: (data: string) => string;
  _generateReceipt: () => void;

  // Cryptographic receipt actions (implemented in store)
  generateCryptographicReceipt: () => Promise<void>;
  downloadSignedReceipt: () => void;
  verifySignedReceipt: () => Promise<{ valid: boolean; message: string }>;
}