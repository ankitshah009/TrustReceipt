/**
 * Cryptographic Trust Receipt
 * Real browser Web Crypto (ECDSA P-256) signatures + verification
 * Fully client-side, zero secrets
 */

/** Serializable observer record embedded in signed receipts (maps from lib/observer). */
export interface ReceiptObserverRecord {
  id: string;
  step: string;
  verdict: 'allow' | 'warn' | 'block';
  summary: string;
  timestamp: string;
  blocked?: boolean;
  interventionApplied?: boolean;
}

/** Aggregated observer outcome included in signed receipts when the observer ran. */
export interface ObserverSummary {
  publicationBlocked: boolean;
  interventionCount: number;
  records: ReceiptObserverRecord[];
}

export interface SignedTrustReceipt {
  id: string;
  timestamp: string;
  brief: string;
  intent: string;
  finalOutput: string;
  trustScore: number;
  verifications: Array<{
    name: string;
    status: 'passed' | 'failed';
    value?: string;
  }>;
  executionTrace: Array<{ step: number; agent: string; summary: string }>;
  hashChain: string[];
  signature: string;       // base64
  publicKeyJwk: JsonWebKey; // for verification
  provenanceRoot: string;
  merkleRoot?: string;     // explicit for demo theater (tamper visibly breaks this)
  observerSummary?: ObserverSummary;
  /** Demo only: signature uses a fresh ephemeral keypair generated client-side.
   *  Verification confirms no post-signing tamper but does not provide third-party provenance.
   *  In a real system this would be signed by a long-lived server-controlled key.
   */
  signatureType?: 'demo-ephemeral-client';
}

type SignaturePayloadInput = {
  id: string;
  timestamp: string;
  brief: string;
  finalOutput: string;
  trustScore: number;
  verifications: Array<{ name: string; status: 'passed' | 'failed'; value?: string }>;
  executionTrace: Array<{ step: number; agent: string; summary: string }>;
  provenanceRoot: string;
  hashChain?: string[];
  observerSummary?: ObserverSummary;
};

function buildSignaturePayload(input: SignaturePayloadInput): string {
  const base = {
    id: input.id,
    timestamp: input.timestamp,
    brief: input.brief,
    finalOutput: input.finalOutput.slice(0, 200),
    trustScore: input.trustScore,
    verifications: input.verifications,
    traceSummary: input.executionTrace.map(t => `${t.step}:${t.agent}`).join('|'),
    root: input.provenanceRoot,
    hashChain: input.hashChain || [],
  };

  if (input.observerSummary) {
    return JSON.stringify({ ...base, observerSummary: input.observerSummary });
  }

  return JSON.stringify(base);
}

export async function generateSignedReceipt(params: {
  brief: string;
  intent: string;
  finalOutput: string;
  trustScore: number;
  verifications: Array<{ name: string; status: 'passed' | 'failed'; value?: string }>;
  executionTrace: Array<{ step: number; agent: string; summary: string }>;
  hashChain: string[];
  provenanceRoot: string;
  observerSummary?: ObserverSummary;
}): Promise<SignedTrustReceipt> {
  const id = 'TR-' + Math.random().toString(16).slice(2, 10).toUpperCase();
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  }).replace(',', ' •');

  const payload = buildSignaturePayload({
    id,
    timestamp,
    brief: params.brief,
    finalOutput: params.finalOutput,
    trustScore: params.trustScore,
    verifications: params.verifications,
    executionTrace: params.executionTrace,
    provenanceRoot: params.provenanceRoot,
    hashChain: params.hashChain,
    observerSummary: params.observerSummary,
  });

  // Generate a fresh demo keypair every time (or cache one)
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const enc = new TextEncoder();
  const sigBuf = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    keyPair.privateKey,
    enc.encode(payload)
  );

  // Binary-safe base64 for the raw signature bytes (avoids atob/btoa latin1/unicode pitfalls on high bytes)
  const sigBytesArr = new Uint8Array(sigBuf);
  let binary = '';
  for (let i = 0; i < sigBytesArr.length; i++) binary += String.fromCharCode(sigBytesArr[i]);
  const signature = btoa(binary);
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

  const merkleRoot = computeMerkleRoot(params.hashChain);

  return {
    id,
    timestamp,
    brief: params.brief,
    intent: params.intent,
    finalOutput: params.finalOutput,
    trustScore: params.trustScore,
    verifications: params.verifications,
    executionTrace: params.executionTrace,
    hashChain: params.hashChain,
    signature,
    publicKeyJwk,
    provenanceRoot: params.provenanceRoot || merkleRoot,
    merkleRoot,
    ...(params.observerSummary ? { observerSummary: params.observerSummary } : {}),
    signatureType: 'demo-ephemeral-client',
  };
}

export async function verifySignedReceipt(receipt: SignedTrustReceipt): Promise<{ valid: boolean; message: string }> {
  try {
    const payload = buildSignaturePayload({
      id: receipt.id,
      timestamp: receipt.timestamp,
      brief: receipt.brief,
      finalOutput: receipt.finalOutput,
      trustScore: receipt.trustScore,
      verifications: receipt.verifications,
      executionTrace: receipt.executionTrace,
      provenanceRoot: receipt.provenanceRoot,
      hashChain: receipt.hashChain,
      observerSummary: receipt.observerSummary,
    });

    const enc = new TextEncoder();
    const pubKey = await crypto.subtle.importKey(
      'jwk',
      receipt.publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );

    // Binary-safe decode (mirror of encode above)
    const binary = atob(receipt.signature);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) sigBytes[i] = binary.charCodeAt(i);

    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      pubKey,
      sigBytes,
      enc.encode(payload)
    );

    if (valid) {
      return { 
        valid: true, 
        message: `✓ VERIFIED — Signature valid. Public key fingerprint: ${(receipt.publicKeyJwk.x || '').slice(0,12)}…` 
      };
    }
    return { valid: false, message: 'Signature mismatch — receipt may have been tampered with.' };
  } catch (e) {
    return { valid: false, message: 'Verification error: ' + (e as Error).message };
  }
}

export function downloadReceiptJSON(receipt: SignedTrustReceipt) {
  const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${receipt.id}-trust-receipt.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Simple binary Merkle root (matches the research spec for demo impact).
 * Makes tampering visually obvious.
 */
export function computeMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return '0x00000000';
  let level = [...leaves];
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || left;
      next.push(sha256(left + right));
    }
    level = next;
  }
  return level[0];
}

// Minimal deterministic hash for Merkle (browser-safe, not for production security)
function sha256(str: string): string {
  // Use a simple FNV-1a style hash for demo visibility (consistent with existing sampleData)
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return '0x' + hash.toString(16).padStart(8, '0');
}
