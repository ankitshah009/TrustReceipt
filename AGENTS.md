<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- **Dev server:** `npm run dev` (port 3000). Requires `GROK_API_KEY` or `XAI_API_KEY` in `.env.local` for live agent calls.
- **Observer layer:** Independent audit agent under `lib/observer/`. It records per-step observer entries and can block publication; implementation is modular—extend types and hooks there without rewriting the UI shell.
- **Blocked runs still complete:** When the observer blocks publication, the workflow finishes normally (human review / off-policy paths included). Pass `observerSummary` into `generateSignedReceipt` in `lib/receipt.ts` so the signed payload captures `publicationBlocked`, `interventionCount`, and `records`.
- **Receipt contract:** `lib/receipt.ts` exports `ObserverSummary` / `ReceiptObserverRecord` and optional `observerSummary` on `SignedTrustReceipt`; verification includes observer fields when present.
- **Lint / build:** `npm run build` for production validation; no separate lint script in package.json unless added later.
