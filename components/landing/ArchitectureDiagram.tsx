export function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 480 280"
      className="h-auto w-full"
      role="img"
      aria-label="Architecture: brief flows to agents and observer in parallel, then trust runtime issues a signed receipt"
    >
      <defs>
        <linearGradient id="tr-arch-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <marker id="tr-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
      </defs>
      <rect width="480" height="280" fill="url(#tr-arch-bg)" rx="12" />

      <rect x="24" y="108" width="88" height="64" rx="8" fill="#fff" stroke="#cbd5e1" />
      <text x="68" y="136" textAnchor="middle" fontSize="11" fill="#334155" fontWeight="600">
        Brief
      </text>
      <text x="68" y="154" textAnchor="middle" fontSize="9" fill="#64748b">
        + intent
      </text>

      <rect x="148" y="48" width="100" height="72" rx="8" fill="#fff" stroke="#2563eb" strokeWidth="1.5" />
      <text x="198" y="78" textAnchor="middle" fontSize="11" fill="#1d4ed8" fontWeight="600">
        Agent pipeline
      </text>
      <text x="198" y="96" textAnchor="middle" fontSize="9" fill="#64748b">
        Plan → Write →
      </text>
      <text x="198" y="108" textAnchor="middle" fontSize="9" fill="#64748b">
        Comply → Publish
      </text>

      <rect x="148" y="160" width="100" height="72" rx="8" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="198" y="192" textAnchor="middle" fontSize="11" fill="#b45309" fontWeight="600">
        Observer
      </text>
      <text x="198" y="210" textAnchor="middle" fontSize="9" fill="#92400e">
        parallel verify
      </text>

      <rect x="284" y="108" width="88" height="64" rx="8" fill="#ecfdf5" stroke="#10b981" />
      <text x="328" y="136" textAnchor="middle" fontSize="11" fill="#047857" fontWeight="600">
        Trust runtime
      </text>
      <text x="328" y="154" textAnchor="middle" fontSize="9" fill="#059669">
        5 dimensions
      </text>

      <rect x="396" y="96" width="72" height="88" rx="8" fill="#0f172a" stroke="#334155" />
      <text x="432" y="132" textAnchor="middle" fontSize="10" fill="#e2e8f0" fontWeight="600">
        Signed
      </text>
      <text x="432" y="148" textAnchor="middle" fontSize="10" fill="#94a3b8">
        receipt
      </text>
      <text x="432" y="168" textAnchor="middle" fontSize="8" fill="#64748b">
        ECDSA P-256
      </text>

      <line x1="112" y1="140" x2="146" y2="84" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#tr-arrow)" />
      <line x1="112" y1="140" x2="146" y2="196" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#tr-arrow)" />
      <line x1="248" y1="84" x2="282" y2="128" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#tr-arrow)" />
      <line x1="248" y1="196" x2="282" y2="152" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#tr-arrow)" />
      <line x1="372" y1="140" x2="394" y2="140" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#tr-arrow)" />

      <text x="240" y="268" textAnchor="middle" fontSize="9" fill="#64748b">
        Observer can block publication — workflow still completes with full audit trail
      </text>
    </svg>
  );
}
