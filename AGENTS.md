<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Trust Receipt is a single Next.js 16 app (no separate backend or database). See `README.md` for product overview and `DEMO_SCRIPT.md` for the judge demo flow.

### Services

| Service | Command | Port | Required? |
|---------|---------|------|-----------|
| Next.js dev server | `npm run dev` | 3000 | Yes |

Run the dev server in tmux for long-lived sessions. Restart it after changing `.env.local` so Next.js reloads environment variables.

### Environment variables

The agent pipeline (Planner, Writer, Compliance, Publisher) calls the xAI Grok API via server actions in `lib/ai/realAgentExecutor.ts`. Without an API key, the UI loads but pipeline steps fail at the first LLM call.

Create `.env.local` (gitignored) with at least one of:

```
GROK_API_KEY=your-xai-key
# or
XAI_API_KEY=your-xai-key
```

Optional: `GROK_MODEL` (defaults to `grok-4.3`).

Do not commit API keys. Do not put secrets in `NEXT_PUBLIC_*` variables.

### Standard commands

- Install: `npm install`
- Dev: `npm run dev` → http://localhost:3000
- Lint: `npm run lint` (pre-existing warnings/errors in the codebase)
- Test: `npm run test` (vitest, 8 unit tests on core hash/compliance logic — no API key needed)
- Build: `npm run build`

### Demo verification

1. Open http://localhost:3000
2. Click **Run Full Happy Path** (or **Run Full Pipeline**)
3. Wait ~30–90s for Grok agent steps to complete
4. Confirm Trust Runtime pillars turn green and a Trust Receipt is generated
5. **Verify Receipt** exercises browser Web Crypto (ECDSA P-256) — no API key needed for this step
