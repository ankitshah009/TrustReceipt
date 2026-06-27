/**
 * Trust Receipt Demo - Sample Data & Policy Rules
 */

import type { DemoMode } from './types';

// ============================================================================
// SAMPLE BRIEFS
// ============================================================================

export const HAPPY_BRIEF = 
  "Write a LinkedIn post about a new battery that lasts 12 hours for consumer electronics. Follow our brand guidelines. Cite that this was tested in our lab under standard conditions.";

export const HAPPY_INTENT = 
  "Promote our new battery product with accurate, sourced performance claims that build trust with enterprise customers.";

export const OFF_POLICY_BRIEF = 
  "Write a LinkedIn post about a new battery that lasts 24 hours for consumer electronics. Make it sound revolutionary and don't mention any testing limitations.";

export const OFF_POLICY_INTENT = 
  "Create maximum hype around battery life to drive viral engagement, even if claims are aggressive.";

// ============================================================================
// POLICY RULES (used by Compliance Agent)
// ============================================================================

export interface PolicyRule {
  id: string;
  rule: string;
  description: string;
  check: (brief: string, draft: string) => { passed: boolean; detail: string };
}

export const POLICY_RULES: PolicyRule[] = [
  {
    id: 'TIME_CLAIM_SOURCED',
    rule: 'No unsubstantiated time claims beyond sourced data',
    description: 'Battery life claims must be backed by explicit test conditions or sources mentioned in the brief',
    check: (brief, draft) => {
      const timeClaimMatch = draft.match(/(\d+)\s*(hour|hr)s?/i);
      if (!timeClaimMatch) return { passed: true, detail: 'No time-based claims detected' };
      
      const claimedHours = parseInt(timeClaimMatch[1], 10);
      const briefHasSource = /tested|lab|standard conditions|source|study/i.test(brief);
      const briefMentionsHours = brief.match(/(\d+)\s*(hour|hr)s?/i);
      const sourcedHours = briefMentionsHours ? parseInt(briefMentionsHours[1], 10) : null;
      
      // Fail if claiming more than sourced, or if no source provided for any claim
      if (!briefHasSource && claimedHours > 0) {
        return { 
          passed: false, 
          detail: `Claims ${claimedHours}h battery life but brief provides no test data or source` 
        };
      }
      if (sourcedHours !== null && claimedHours > sourcedHours) {
        return { 
          passed: false, 
          detail: `Claims ${claimedHours}h but brief only sources ${sourcedHours}h` 
        };
      }
      return { passed: true, detail: `Battery claim of ${claimedHours}h matches sourced data` };
    }
  },
  {
    id: 'MUST_CITE_SOURCES',
    rule: 'Must cite sources or test methodology',
    description: 'Content making performance claims should reference how data was obtained',
    check: (brief, draft) => {
      const hasClaim = /lasts|hours|performance|tested|lab/i.test(draft);
      const hasCitation = /tested|lab|study|source|according|data shows|conditions/i.test(draft);
      
      if (hasClaim && !hasCitation) {
        return { 
          passed: false, 
          detail: 'Performance claims made without citing test methodology or sources' 
        };
      }
      return { passed: true, detail: 'Sources or methodology referenced in content' };
    }
  },
  {
    id: 'TONE_PROFESSIONAL',
    rule: 'Tone must remain professional for B2B audience',
    description: 'Avoid hype language like "revolutionary", "game-changing", "unprecedented"',
    check: (_brief, draft) => {
      const hypeWords = ['revolutionary', 'game-changing', 'unprecedented', 'mind-blowing', 'insane', 'epic'];
      const found = hypeWords.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(draft));
      
      if (found.length > 0) {
        return { 
          passed: false, 
          detail: `Unprofessional hype language detected: ${found.join(', ')}` 
        };
      }
      return { passed: true, detail: 'Tone is professional and appropriate for enterprise audience' };
    }
  },
  {
    id: 'NO_ABSOLUTES',
    rule: 'Avoid absolute language without qualification',
    description: 'Words like "always", "never", "guaranteed", "impossible" require evidence',
    check: (_brief, draft) => {
      const absolutes = ['always', 'never', 'guaranteed', '100%', 'impossible', 'perfect'];
      const found = absolutes.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(draft));
      
      if (found.length > 0) {
        return { 
          passed: false, 
          detail: `Absolute claims without qualification: ${found.join(', ')}` 
        };
      }
      return { passed: true, detail: 'No unsubstantiated absolute claims detected' };
    }
  },
  {
    id: 'BRAND_ALIGNMENT',
    rule: 'Content must align with stated intent',
    description: 'Output should reflect the original brief and intent without drift',
    check: (brief, draft) => {
      const briefKeywords = brief.toLowerCase().match(/\b(battery|hours|electronics|consumer|test|lab)\b/g) || [];
      const draftLower = draft.toLowerCase();
      const matchedCount = briefKeywords.filter(kw => draftLower.includes(kw)).length;
      
      if (briefKeywords.length > 0 && matchedCount / briefKeywords.length < 0.5) {
        return { 
          passed: false, 
          detail: 'Content has drifted significantly from original brief keywords' 
        };
      }
      return { passed: true, detail: 'Content stays aligned with brief scope and terminology' };
    }
  },
];

// ============================================================================
// REALISTIC AGENT OUTPUT TEMPLATES
// ============================================================================

export function generatePlannerOutput(brief: string, isOffPolicy: boolean): {
  keyFacts: string[];
  plan: string[];
  estimatedClaims: string[];
  sources: string[];
} {
  const baseFacts = [
    'Product: Next-gen consumer electronics battery',
    'Target: B2B / enterprise LinkedIn audience',
    'Tone: Professional, evidence-based',
  ];
  
  const basePlan = [
    'Extract performance claim from brief',
    'Reference testing methodology or source',
    'Draft LinkedIn post with clear value prop',
    'Ensure compliance with brand guidelines',
  ];
  
  if (isOffPolicy) {
    return {
      keyFacts: [
        ...baseFacts,
        'Claim in brief: 24-hour battery life (UNSOURCED)',
        'Risk: No lab data or test conditions provided',
      ],
      plan: [
        ...basePlan,
        '⚠️ FLAG: Claim exceeds any documented source',
        '⚠️ FLAG: Will trigger compliance review',
      ],
      estimatedClaims: ['24 hours battery life'],
      sources: ['None provided in brief'],
    };
  }
  
  return {
    keyFacts: [
      ...baseFacts,
      'Claim in brief: 12-hour battery life',
      'Source: "Tested in our lab under standard conditions"',
    ],
    plan: [
      ...basePlan,
      'Include "lab tested, standard conditions" attribution',
    ],
    estimatedClaims: ['12 hours battery life'],
    sources: ['Internal lab test', 'Standard conditions'],
  };
}

export function generateWriterDraft(
  brief: string, 
  planner: ReturnType<typeof generatePlannerOutput>,
  isOffPolicy: boolean
): string {
  const hours = isOffPolicy ? '24' : '12';
  const sourceNote = isOffPolicy 
    ? '' 
    : ' Lab-tested under standard conditions.';
  
  const tone = isOffPolicy 
    ? 'Revolutionary breakthrough in battery technology. Our new cells deliver an incredible 24 hours of continuous power—far surpassing anything else on the market today.'
    : 'We\'re excited to share that our latest battery cells have demonstrated 12-hour endurance in internal testing.';
  
  return `${tone}${sourceNote}

This performance opens new possibilities for always-connected devices without the constant need to recharge. For teams building portable electronics, IoT sensors, or mobile equipment, reliable power matters.

Key specs:
• ${hours}-hour continuous operation (lab verified)
• Standard form factor for easy integration
• Designed for high-cycle reliability

If you're evaluating power solutions for your next product, happy to share more details.

#BatteryTech #Electronics #Hardware`;
}

export function generatePublisherPost(draft: string, isOffPolicy: boolean): {
  linkedInPost: string;
  hashtags: string[];
  callToAction: string;
} {
  // Clean up draft for LinkedIn format
  const post = draft.trim();
  
  return {
    linkedInPost: post,
    hashtags: isOffPolicy 
      ? ['#BatteryTech', '#Innovation', '#FutureOfPower', '#TechLaunch']
      : ['#BatteryTech', '#Electronics', '#Hardware', '#ProductDev'],
    callToAction: isOffPolicy
      ? 'Comment "POWER" if you want early access.'
      : 'DM us or comment below to learn more about integration options.',
  };
}

// ============================================================================
// COMPLIANCE SIMULATION
// ============================================================================

export function runComplianceCheck(
  brief: string, 
  draft: string, 
  isOffPolicy: boolean
): {
  passed: boolean;
  alignmentScore: number;
  reasons: Array<{ rule: string; status: 'PASS' | 'FAIL'; detail: string }>;
  policyChecks: Array<{ ruleId: string; rule: string; passed: boolean; detail: string }>;
} {
  const reasons: Array<{ rule: string; status: 'PASS' | 'FAIL'; detail: string }> = [];
  const policyChecks: Array<{ ruleId: string; rule: string; passed: boolean; detail: string }> = [];
  
  let passedCount = 0;
  
  for (const policy of POLICY_RULES) {
    const result = policy.check(brief, draft);
    const check = {
      ruleId: policy.id,
      rule: policy.rule,
      passed: result.passed,
      detail: result.detail,
    };
    policyChecks.push(check);
    
    reasons.push({
      rule: policy.rule,
      status: result.passed ? 'PASS' : 'FAIL',
      detail: result.detail,
    });
    
    if (result.passed) passedCount++;
  }
  
  const alignmentScore = Math.round((passedCount / POLICY_RULES.length) * 100);
  
  // Force off-policy to fail on time claim
  const finalPassed = isOffPolicy ? false : (alignmentScore >= 60);
  
  return {
    passed: finalPassed,
    alignmentScore: isOffPolicy ? Math.max(20, alignmentScore - 40) : alignmentScore,
    reasons,
    policyChecks,
  };
}

// ============================================================================
// INTENT ALIGNMENT SIMULATION (keyword-based similarity)
// ============================================================================

export function computeIntentAlignment(
  brief: string,
  currentOutput: string
): {
  score: number;
  keywords: string[];
  matchedTerms: string[];
  driftDetected: boolean;
} {
  // Extract meaningful keywords from brief
  const stopWords = new Set(['write', 'about', 'that', 'for', 'our', 'the', 'and', 'with', 'from', 'this', 'follow']);
  
  const briefWords = brief.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  const uniqueKeywords = Array.from(new Set(briefWords)).slice(0, 8);
  
  const outputLower = currentOutput.toLowerCase();
  const matchedTerms = uniqueKeywords.filter(kw => outputLower.includes(kw));
  
  const baseScore = uniqueKeywords.length > 0 
    ? Math.round((matchedTerms.length / uniqueKeywords.length) * 100)
    : 85;
  
  // Add some realistic variance
  const jitter = Math.floor(Math.random() * 5) - 2;
  const score = Math.max(70, Math.min(99, baseScore + jitter));
  
  return {
    score,
    keywords: uniqueKeywords,
    matchedTerms,
    driftDetected: score < 75,
  };
}

// ============================================================================
// PROVENANCE HASH GENERATION (simple deterministic hash for demo)
// ============================================================================

export function generateHash(input: string): string {
  // Simple FNV-1a inspired hash for demo (not cryptographic, but looks real)
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return '0x' + hash.toString(16).padStart(8, '0');
}

export function buildHashChain(steps: Array<{ step: string; data: string }>): string[] {
  const chain: string[] = [];
  let prevHash = '0x00000000';
  
  for (const s of steps) {
    const combined = `${prevHash}:${s.step}:${s.data}`;
    const h = generateHash(combined);
    chain.push(h);
    prevHash = h;
  }
  
  return chain;
}

// ============================================================================
// MODE HELPERS
// ============================================================================

export function getBriefForMode(mode: DemoMode): { brief: string; intent: string } {
  if (mode === 'off-policy') {
    return { brief: OFF_POLICY_BRIEF, intent: OFF_POLICY_INTENT };
  }
  return { brief: HAPPY_BRIEF, intent: HAPPY_INTENT };
}

export const DEFAULT_BRIEF = HAPPY_BRIEF;
export const DEFAULT_INTENT = HAPPY_INTENT;