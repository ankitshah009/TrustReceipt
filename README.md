# Trust Receipt
## The proof behind every AI decision.

**Real platform** — a runtime trust layer that uses actual LLM agents to generate content and produces a cryptographically signed, verifiable Trust Receipt using browser Web Crypto (ECDSA P-256).

![Trust Receipt UI](https://via.placeholder.com/1200x630?text=Trust+Receipt+Demo+UI)

## What it does (exactly matching the image)
- Reproduces the full visual layout: header + 3-col layout + workflow diagram + Trust Runtime bar + THE TRUST RECEIPT panel + Off/On-policy catch cards.
- **End-to-end live demo**: Click "Run Full Demo" — agents animate sequentially with live logs.
- **Trust Runtime** runs in real time (Identity, Authority, Intent Alignment %, Policy Compliance, Provenance).
- **Off-policy killer feature**: Run "Run with Off-Policy Brief" → Compliance detects "24h" unsupported claim → shows red card + routes to **Human-in-the-Loop** (Approve or Reject).
- **Cryptographic Trust Receipt**:
  - Auto-generated with real browser Web Crypto (ECDSA P-256) signature
  - Download JSON (full provenance + trace + checks)
  - "Verify Receipt" button proves it hasn't been tampered with (client-side)
- Perfect 60–90 second judge flow.

## Hackathon Winning Tactics (from full research)
1. **Judge, You Try It** — Prominent editable brief + "Run my brief" so judges feel ownership.
2. **Real Cryptography** — Independent verify in browser; no trust us.
3. **Emotional Narrative** — Lead with the red off-policy failure for the "oh no" moment, then beautiful green receipt flip.
4. **Instant Feedback** — <2s staggered pillar checkmarks + color change = satisfying.
5. **Shareable Artifact** — Download + copyable receipt text; imagine QR in real version.
6. **Human-in-the-Loop Prominent** — Not buried; big buttons on the failure card.
7. **Polish & Backup** — 3s reset, practiced script, 60s video backup.

See updated DEMO_SCRIPT.md for the exact 7-min arc (start with off-policy for max impact).

## Quick start (real agents)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

**Important for real execution (using Grok API):**
1. Set your Grok / xAI API key:
   - `GROK_API_KEY=your-key-here` 
   - or `XAI_API_KEY=your-key-here`
   - You can put it in `.env.local`
2. The pipeline now calls **real Grok models** for Planner, Writer, Compliance judgment, and Publisher steps.
3. No more simulated templates — every agent step is powered by Grok.

Then:
1. Click **Run Full Pipeline** — real LLM agents execute each step.
2. Click **Run Risky Brief** — give the agents a challenging brief and watch the trust layer catch violations.
3. Click **Verify Receipt** + **Download JSON** — real ECDSA signature + merkle proof.
4. Edit the brief and rerun.

## For judges (script)
"See the problem — AI agents can publish anything with zero proof.
Now watch the Trust Runtime verify every single step live.
Here it catches an off-policy exaggeration and routes to a human.
Approved path succeeds. Here's the signed receipt. 
I can download it and verify the signature in the browser — zero backend, cryptographically sound.
This is the runtime trust layer."

## Tech highlights (real platform)
- **Real Grok 4.3 agents**: Planner, Writer, Compliance, and Publisher steps use actual LLM calls via xAI Grok API (configurable to other Grok models).
- 100% browser-native cryptographic receipts (ECDSA P-256 via Web Crypto) — no secrets shipped.
- Real-time trust runtime with hash chaining and Merkle roots.
- Human-in-the-loop as first-class signed step.
- Tamper-evident receipts with instant verification.
- Fully extensible — replace any agent with your own prompts/models.

## Running with Grok API
```bash
# 1. Set your xAI key
echo "GROK_API_KEY=your_xai_key_here" > .env.local

# 2. (Optional) Choose a different Grok model
# echo "GROK_MODEL=grok-build-0.1" >> .env.local

npm install
npm run dev
```

Open http://localhost:3000

Use real briefs — the agents will generate actual content using Grok 4.3 (or your chosen model).

## How the Trust Layer works (real, not simulated)
1. Real agents execute the workflow using Grok.
2. Each output is hashed into a chain.
3. A signed receipt is created using real ECDSA P-256 in the browser.
4. You can verify the receipt offline — the signature proves it hasn't been tampered with.

---

Run `npm run build` to verify everything works in production mode.

# 2. Run dev server
npm run dev
```

Open http://localhost:3000

## Controls (top bar)

- **Run Full Happy Path** — loads clean 12h battery brief + runs entire pipeline
- **Simulate Off-Policy Brief** — loads 24h battery claim (will fail compliance)
- **Run Demo** — runs whatever brief is currently in the input
- **Pause / Resume / Step / Reset** — fine-grained simulation control
- **Speed chips** — 0.5× / 1× / 2× animation timing

## Architecture

```
app/
  page.tsx                 → mounts <TrustDemo />
  layout.tsx               → dark theme + sonner toaster
  globals.css              → all demo tokens + animations

lib/
  types.ts                 → full TypeScript contracts (WorkflowStep, TrustRuntimeState, etc)
  sampleData.ts            → briefs, policy rules, realistic output generators
  simulator.ts             → step executors + timing + hash helpers
  store.ts                 → Zustand state machine + live trust updates + trace

components/
  TrustDemo.tsx            → complete UI (workflow, trace, trust meters, human review, receipt JSON)
```

## Policy Rules (Compliance Agent)

1. `TIME_CLAIM_SOURCED` — No unsubstantiated battery hours beyond brief sources
2. `MUST_CITE_SOURCES` — Performance claims must mention test/lab/source
3. `TONE_PROFESSIONAL` — No hype words (revolutionary, game-changing, etc.)
4. `NO_ABSOLUTES` — No "always/never/guaranteed" without evidence
5. `BRAND_ALIGNMENT` — Output must stay lexically close to brief

## Data Model (for later receipt generator)

When the demo completes, the bottom "RECEIPT DATA" block contains a plain object:

```ts
{
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
```

This is ready to be signed / hashed / persisted by a real receipt service.

## Notes

- All agent behavior is deterministic + lightly randomized for visual polish (no external LLM calls).
- Hash chain is FNV-1a inspired (demo only; replace with real crypto for production).
- Intent alignment is simple keyword overlap (good enough for live demo; swap in embeddings later).

## Future Integration

- Plug real LLM calls into `simulator.ts` executors
- Replace `generateHash` with Ed25519 or similar
- POST `receipt` object to `/api/receipts` when generator is ready

---

Built for live demo at AGI House Hackathon 2026.
