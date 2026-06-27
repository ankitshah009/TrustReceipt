/**
 * Cryptographic Trust Receipt
 * Real browser Web Crypto (ECDSA P-256) signatures + verification
 * Fully client-side, zero secrets, perfect for hackathon demos
 */

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
}): Promise<SignedTrustReceipt> {
  const id = 'TR-' + Math.random().toString(16).slice(2, 10).toUpperCase();
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  }).replace(',', ' •');

  const payload = JSON.stringify({
    id,
    timestamp,
    brief: params.brief,
    finalOutput: params.finalOutput.slice(0, 200),
    trustScore: params.trustScore,
    verifications: params.verifications,
    traceSummary: params.executionTrace.map(t => `${t.step}:${t.agent}`).join('|'),
    root: params.provenanceRoot,
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

  const signature = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
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
  } as any; // merkleRoot added for demo
}

export async function verifySignedReceipt(receipt: SignedTrustReceipt): Promise<{ valid: boolean; message: string }> {
  try {
    const payload = JSON.stringify({
      id: receipt.id,
      timestamp: receipt.timestamp,
      brief: receipt.brief,
      finalOutput: receipt.finalOutput.slice(0, 200),
      trustScore: receipt.trustScore,
      verifications: receipt.verifications,
      traceSummary: receipt.executionTrace.map(t => `${t.step}:${t.agent}`).join('|'),
      root: receipt.provenanceRoot,
    });

    const enc = new TextEncoder();
    const pubKey = await crypto.subtle.importKey(
      'jwk',
      receipt.publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['verify']
    );

    const sigBytes = Uint8Array.from(atob(receipt.signature), c => c.charCodeAt(0));

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
