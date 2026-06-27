'use server';

import { generateText, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

import type {
  PlannerOutput,
  WriterOutput,
  ComplianceResult,
  PublisherOutput,
  ComplianceReason,
  PolicyCheck,
} from '../types';

import { POLICY_RULES } from '../sampleData';

// Grok (xAI) - OpenAI compatible API
// Set GROK_API_KEY or XAI_API_KEY in your environment
const grok = createOpenAI({
  baseURL: 'https://api.x.ai/v1',
  apiKey: process.env.GROK_API_KEY || process.env.XAI_API_KEY,
});

// Configurable via env. Default to Grok 4.3 (the flagship model).
// Other Grok models: 'grok-4.3-latest', 'grok-build-0.1' (for coding tasks)
const MODEL_NAME = process.env.GROK_MODEL || 'grok-4.3';
const model = grok(MODEL_NAME);

// -----------------------------------------------------------------------------
// PLANNER AGENT - Real LLM
// -----------------------------------------------------------------------------
const plannerSchema = z.object({
  keyFacts: z.array(z.string()),
  plan: z.array(z.string()),
  estimatedClaims: z.array(z.string()),
  sources: z.array(z.string()),
});

export async function runRealPlanner(brief: string, intent: string): Promise<PlannerOutput> {
  const { object } = await generateObject({
    model,
    schema: plannerSchema,
    prompt: `You are the Planner Agent in a content generation pipeline.

Brief: ${brief}
Intent: ${intent}

Extract:
- keyFacts: important facts from the brief
- plan: step by step plan to create the output
- estimatedClaims: specific claims that will appear in the output
- sources: any mentioned or implied sources

Return strict JSON only.`,
  });

  return {
    ...object,
    timestamp: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// WRITER AGENT - Real LLM
// -----------------------------------------------------------------------------
export async function runRealWriter(
  brief: string,
  planner: PlannerOutput,
  intent: string,
  isRisky: boolean = false
): Promise<WriterOutput> {
  const riskInstruction = isRisky 
    ? 'Be aggressive and hype. You may stretch claims for maximum impact even if support is thin.'
    : 'Stay faithful to the brief and only make claims that are well supported.';

  const { text } = await generateText({
    model,
    prompt: `You are the Writer Agent.

Brief: ${brief}
User Intent: ${intent}

Key facts from planner:
${planner.keyFacts.join('\n')}

Plan:
${planner.plan.join('\n')}

Estimated claims:
${planner.estimatedClaims.join(', ')}

${riskInstruction}

Generate a professional LinkedIn post draft that fulfills the brief and intent.
Be accurate to sources when mentioned.
Keep it concise, engaging for B2B audience, and include relevant hashtags at the end.

Return only the post content.`,
  });

  const draft = text.trim();
  const wordCount = draft.split(/\s+/).length;

  return {
    draft,
    wordCount,
    tone: 'Professional',
    claims: planner.estimatedClaims,
    timestamp: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// COMPLIANCE AGENT - Real LLM judgment against policies
// -----------------------------------------------------------------------------
const complianceSchema = z.object({
  passed: z.boolean(),
  alignmentScore: z.number().min(0).max(100),
  reasons: z.array(
    z.object({
      rule: z.string(),
      status: z.enum(['PASS', 'FAIL']),
      detail: z.string(),
    })
  ),
  policyChecks: z.array(
    z.object({
      ruleId: z.string(),
      rule: z.string(),
      passed: z.boolean(),
      detail: z.string(),
    })
  ),
});

export async function runRealCompliance(
  brief: string,
  draft: string
): Promise<ComplianceResult> {
  const policyText = POLICY_RULES.map(
    (p) => `- ${p.id}: ${p.rule}\n  ${p.description}`
  ).join('\n');

  const { object } = await generateObject({
    model,
    schema: complianceSchema,
    prompt: `You are the Compliance Agent.

You must rigorously evaluate the following draft against the policies.

Policies:
${policyText}

Brief (intent source):
${brief}

Draft to evaluate:
${draft}

For each policy, decide PASS or FAIL with a short explanation.
Compute an overall alignmentScore 0-100.
Decide if the draft overall "passed" (all critical policies satisfied).

Return strict structured data.`,
  });

  return {
    ...object,
    timestamp: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// PUBLISHER AGENT - Real LLM formatting
// -----------------------------------------------------------------------------
const publisherSchema = z.object({
  linkedInPost: z.string(),
  hashtags: z.array(z.string()),
  callToAction: z.string(),
});

export async function runRealPublisher(draft: string): Promise<PublisherOutput> {
  const { object } = await generateObject({
    model,
    schema: publisherSchema,
    prompt: `You are the Publisher Agent.

Take this draft and turn it into a polished LinkedIn-ready post.

Draft:
${draft}

Return:
- linkedInPost: the final post text (ready to copy-paste)
- hashtags: relevant professional hashtags (without #)
- callToAction: a short CTA line

Keep the core message faithful to the draft.`,
  });

  return {
    ...object,
    timestamp: new Date().toISOString(),
  };
}
