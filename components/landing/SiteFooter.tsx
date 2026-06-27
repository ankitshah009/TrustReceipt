const FOOTER_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#security", label: "Security" },
  { href: "#contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-zinc-200/80 bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[-0.02em] text-zinc-950">
              Trust Receipt
            </p>
            <nav
              className="mt-4 flex flex-wrap gap-x-6 gap-y-2"
              aria-label="Footer"
            >
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
          <p className="text-sm text-zinc-500">© 2026 Trust Receipt</p>
        </div>
      </div>
    </footer>
  );
}
