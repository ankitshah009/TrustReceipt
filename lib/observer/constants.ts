import type { TrustDimension } from './types';

export const OBSERVER_DIMENSIONS: ReadonlyArray<{ key: TrustDimension; label: string }> = [
  { key: 'identity', label: 'Identity' },
  { key: 'authority', label: 'Authority' },
  { key: 'intent', label: 'Intent' },
  { key: 'policy', label: 'Policy' },
  { key: 'provenance', label: 'Provenance' },
] as const;
