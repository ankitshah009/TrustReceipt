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

1. Open http://localhost:3000
2. Click **Start a workflow** or **Run workflow** in the workspace (`#app`)
3. Wait ~30–90s for Grok agent steps to complete
4. Confirm Observer panel, step timeline, and Trust Receipt reflect allow or needs-review
5. **Verify integrity** on the receipt exercises browser Web Crypto (ECDSA P-256)
