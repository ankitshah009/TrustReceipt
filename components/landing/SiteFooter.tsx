const FOOTER_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#mission", label: "Mission" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-zinc-200/80 bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 sm:items-start">
          <div>
            <p className="text-sm font-medium tracking-[-0.02em] text-zinc-950">
              Trust Receipt
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
              Runtime trust for agent workflows — signed receipts your team and auditors can
              verify offline.
            </p>
            <p className="mt-4 text-sm">
              <a
                href="mailto:hello@trustreceipt.dev"
                className="font-medium text-blue-700 hover:text-blue-800"
              >
                hello@trustreceipt.dev
              </a>
              <span className="text-zinc-500"> · Early access &amp; pilots</span>
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end" aria-label="Footer">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-zinc-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">
            Demo includes rate limiting and input validation. API keys never exposed to the browser.
          </p>
          <p className="text-sm text-zinc-500">© 2026 Trust Receipt</p>
        </div>
      </div>
    </footer>
  );
}
