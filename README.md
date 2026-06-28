# Trust Receipt

**The proof behind every AI decision.**

Trust Receipt is a runtime trust layer for agentic workflows. LLM agents plan, write, and publish content while a parallel **trust runtime** continuously verifies identity, authority, intent alignment, policy compliance, and provenance. When the run finishes—whether publication succeeds or is blocked—the platform issues a **cryptographically signed Trust Receipt** (ECDSA P-256 via browser Web Crypto) that anyone can download and verify offline.

An **Observer Agent** sits alongside the pipeline as an independent audit layer. It watches each step, records interventions, and can block publication when policy or grounding checks fail. Observer outcomes are summarized in the signed receipt (`publicationBlocked`, `interventionCount`, and per-step `records`) so downstream systems get a tamper-evident audit trail, not just the final output. The observer module lives under `lib/observer/` as an expandable package: wire new checks, storage backends, or agent backends without changing the receipt contract in `lib/receipt.ts`.

## Quick start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

Set `GROK_API_KEY` or `XAI_API_KEY` in `.env.local` for live Grok agent execution. Use **Start a workflow** on the landing page to run the pipeline, inspect the trust runtime, and generate or verify a signed receipt. Run `npm run build` for a production check.

## Production (Vercel)

| | |
|---|---|
| **URL** | https://trust-receipt.vercel.app |
| **Branch** | Deploy from `main` with `npx vercel deploy --prod --yes` |
| **Env** | Set `GROK_API_KEY` or `XAI_API_KEY` in Vercel → Project → Settings → Environment Variables (Production) |

GitHub auto-deploy: connect the repo in the Vercel project settings if not already linked (`ankitshah009/trustreceipt` → `main`).

### Security (public demo)

Per-IP rate limits on LLM server actions, input length caps, IP blocklist (`TRUST_RECEIPT_BLOCKED_IPS`), CSP/HSTS headers. See `AGENTS.md` for env overrides. For multi-region quotas, add Redis/Upstash.

## Layout

```
app/                     → Next.js routes and global styles
components/landing/      → Product landing + workspace UI
lib/
  receipt.ts             → Signed receipt types, sign/verify helpers
  observer/              → Observer Agent (audit records, interventions)
  store.ts, simulator.ts → Workflow state and agent execution
```
