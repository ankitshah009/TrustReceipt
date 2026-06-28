import { Check, Minus } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

type Cell = "yes" | "partial" | "no";

const ROWS: { label: string; traces: Cell; guardrails: Cell; receipt: Cell }[] = [
  { label: "Shows what agents did", traces: "yes", guardrails: "partial", receipt: "yes" },
  { label: "Blocks policy violations", traces: "no", guardrails: "yes", receipt: "yes" },
  { label: "Tamper-evident proof", traces: "no", guardrails: "no", receipt: "yes" },
  { label: "Offline verification", traces: "no", guardrails: "no", receipt: "yes" },
  { label: "Human review in artifact", traces: "partial", guardrails: "no", receipt: "yes" },
];

function CellIcon({ value }: { value: Cell }) {
  if (value === "yes") {
    return <Check className="mx-auto h-4 w-4 text-emerald-600" strokeWidth={2.5} aria-label="Yes" />;
  }
  if (value === "partial") {
    return <Minus className="mx-auto h-4 w-4 text-amber-500" strokeWidth={2.5} aria-label="Partial" />;
  }
  return <span className="mx-auto block h-1 w-1 rounded-full bg-zinc-300" aria-label="No" />;
}

export function ComparisonSection() {
  return (
    <section className="border-b border-zinc-200/80 bg-[#fafafa] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Why Trust Receipt"
          title="Observability plus guardrails isn't enough"
          description="You need cryptographic proof that survives disputes, audits, and vendor boundaries."
        />

        <div className="mt-10 overflow-x-auto sm:mt-14">
          <table className="w-full min-w-[540px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="py-3 pr-4 font-medium text-zinc-500" scope="col">
                  Capability
                </th>
                <th className="px-3 py-3 text-center font-medium text-zinc-500" scope="col">
                  Traces / observability
                </th>
                <th className="px-3 py-3 text-center font-medium text-zinc-500" scope="col">
                  Guardrails
                </th>
                <th className="px-3 py-3 text-center font-semibold text-blue-700" scope="col">
                  Trust Receipt
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-zinc-100">
                  <td className="py-3.5 pr-4 text-zinc-800">{row.label}</td>
                  <td className="px-3 py-3.5 text-center">
                    <CellIcon value={row.traces} />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <CellIcon value={row.guardrails} />
                  </td>
                  <td className="bg-blue-50/50 px-3 py-3.5 text-center">
                    <CellIcon value={row.receipt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
