# Trust Receipt – AGI House Hackathon Winning 60-90s Script

**Core philosophy (from deep research):** Lead with dramatic failure (off-policy red path) for emotional impact. Then success + cryptographic verify + live tamper demo. The receipt *is* the product. Judges remember the "gotcha" and the "I can verify this myself" moment.

Speak slowly. Click deliberately. Let judges touch things.

## 0. Setup (before judges arrive)
```bash
npm run dev
# http://localhost:3000
```
- Have a downloaded example receipt JSON ready on desktop.
- Practice the full flow 3+ times (including tamper).
- Have 60s backup Loom video ready.
- Know the exact 3-4 policy rules in the demo.

## 1. 0-15s — Hook + Problem (crystal clear narrative)
"Right now when an AI agent writes content or takes an action, you have **zero cryptographic proof** that it followed the rules or told the truth.

LangSmith shows traces you have to trust the vendor for. Guardrails just say 'no'. 

Trust Receipt is the missing runtime trust layer: every step is hashed, chained, and signed. The final receipt is verifiable in a browser with zero backend."

## 2. 15-40s — Run the BAD path first (drama)
"Let’s watch what happens when the agent tries to make an unsupported claim."

- Click **"Run with Off-Policy Brief"** (or let a judge edit the brief to say "lasts 48 hours" or "revolutionary breakthrough")
- Red "OFF-POLICY OUTPUT DETECTED" card appears instantly.
- "The policy engine caught the unsupported 24-hour claim in <200ms. No further steps executed."
- Point at the human review buttons.
- "Human-in-the-loop is a first-class signed step — not an afterthought."

(Let the judge click Approve or Reject. Both are impressive.)

## 3. 40-60s — Run the GOOD path + live pillars
"Now the correct, sourced claim."

- Click **"Run Full Demo"** (or "Run my brief (happy)")
- Narrate the 6 agents lighting up in sequence.
- Watch the 5 Trust Runtime pillars turn green one-by-one with the checkmark animation.
- "Identity. Authority. Intent alignment 98%. Policy passed. Full provenance."

Receipt appears with beautiful dark panel.

## 4. 60-80s — Cryptographic verify + Tamper theater (the money shot)
"Click **Verify Receipt**. This is pure browser Web Crypto (ECDSA P-256). No server call."

- Verify succeeds → "Signature valid. Merkle chain intact."

"Now watch what happens if anyone tampers with the output after the fact."

- Click the **"Tamper Test (modify & re-verify)"** button (or manually edit the downloaded JSON and re-verify).
- Chain breaks visibly. Red state. "Merkle root no longer matches. This receipt is now provably invalid."

"Download the receipt. Open it on your phone later. It still verifies. Portable, offline, auditable proof."

## 5. 80-90s — Close + "Judge, you try it"
"Trust Receipt turns every agent run into something you can show a regulator, a customer, or a court.

Edit the brief yourself and hit Run — the runtime reacts live."

(Hand them the keyboard.)

**Positioning line (use if they ask how you’re different):**
"LangSmith tells you what happened. Guardrails stop bad things. Trust Receipt proves — with cryptography you control — exactly what happened and that it was allowed."

---

## Exact Microcopy to Use in UI (research-backed)

- After bad path caught: "Policy violation detected. Unsupported claim. Execution halted."
- Success banner: "SAFE TO PUBLISH — All policy gates passed. Merkle root committed."
- Verify label: "Verify cryptographically (works offline)"
- After good verify: "Signature valid ✓  Merkle chain intact ✓"
- After tamper: "INVALID: Signature or Merkle root mismatch. This receipt has been tampered with."
- Pillar labels: "Identity Verified", "Authority Verified", "Intent Alignment 98% Aligned", "Policy Compliance Passed", "Source Grounding 100% supported", "Provenance Complete"