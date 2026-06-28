<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Trust Receipt is a single Next.js 16 app (no separate backend or database). See `README.md` for product overview.

### Services

| Service | Command | Port | Required? |
|---------|---------|------|-----------|
| Next.js dev server | `npm run dev` | 3000 | Yes |

Run the dev server in tmux for long-lived sessions. Restart it after changing `.env.local` so Next.js reloads environment variables.

### Environment variables

The agent pipeline (Planner, Writer, Compliance, Publisher) calls the xAI Grok API via server actions in `lib/ai/realAgentExecutor.ts`. Without an API key, the UI loads but workflow steps fail at the first LLM call.

Create `.env.local` (gitignored) with at least one of:

```
GROK_API_KEY=your-xai-key
# or
XAI_API_KEY=your-xai-key
```

Optional: `GROK_MODEL` (defaults to `grok-4.3`).

Do not commit API keys. Do not put secrets in `NEXT_PUBLIC_*` variables.

### Observer layer

Independent audit agent under `lib/observer/`. It records per-step observer entries and can block publication; extend types and hooks there without rewriting the UI shell.

When the observer blocks publication, the workflow still completes through OUTPUT (human review / off-policy paths included). Pass `observerSummary` into `generateSignedReceipt` in `lib/receipt.ts` so the signed payload captures `publicationBlocked`, `interventionCount`, and `records`.

### Standard commands

- Install: `npm install`
- Dev: `npm run dev` → http://localhost:3000
- Lint: `npm run lint`
- Test: `npm run test` (vitest — observer + core trust tests; no API key needed for unit tests)
- Build: `npm run build`

### Workflow verification

1. Open http://localhost:3000 (or production: https://trust-receipt.vercel.app)
2. Click **Start a workflow** or **Run workflow** in the workspace (`#app`)
3. Wait ~30–90s for Grok agent steps to complete
4. Confirm Observer panel, step timeline, and Trust Receipt reflect allow or needs-review
5. **Verify integrity** on the receipt exercises browser Web Crypto (ECDSA P-256)

### Vercel production

- Project: `trust-receipt` under team `ankit-shahs-projects-523d1fc7`
- URL: https://trust-receipt.vercel.app
- Deploy: `npx vercel deploy --prod --yes` from repo root (requires Vercel CLI login)
- Env: `GROK_API_KEY` / `XAI_API_KEY` must be set in Vercel project settings for Production
- Connect GitHub repo `ankitshah009/trustreceipt` → branch `main` in dashboard for auto-deploy on push

### Production security (public demo)

LLM server actions are protected by:

- Per-IP rate limits and concurrent run caps (`lib/security/rateLimit.ts`, `lib/security/guard.ts`)
- Input length validation on brief/intent/draft (`lib/security/validateInput.ts`)
- IP blocklist via `TRUST_RECEIPT_BLOCKED_IPS` (comma-separated)
- Security headers in `middleware.ts` and CSP/HSTS in `next.config.ts`

Optional env overrides:

```
TRUST_RECEIPT_RATE_LIMIT_ACTIONS=24      # LLM calls per IP per window (~6 workflows)
TRUST_RECEIPT_RATE_LIMIT_WINDOW_MS=3600000
TRUST_RECEIPT_MAX_CONCURRENT=2
TRUST_RECEIPT_BRIEF_MAX_LENGTH=8000
TRUST_RECEIPT_INTENT_MAX_LENGTH=512
TRUST_RECEIPT_DISABLE_RATE_LIMIT=true    # local dev only
```

For multi-instance production quotas, add Upstash/Vercel KV and replace in-memory limiter.
