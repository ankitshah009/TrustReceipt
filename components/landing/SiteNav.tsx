import Link from "next/link";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
] as const;

export function SiteNav() {
  return (
    <header className="border-b border-zinc-200/80 bg-[#fafafa]">
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6"
        aria-label="Main"
      >
        <Link
          href="/"
          className="text-[15px] font-medium tracking-[-0.02em] text-zinc-950 outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          Trust Receipt
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-950"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#app"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Get started
        </a>
      </nav>
    </header>
  );
}
