"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#security", label: "Security" },
] as const;

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[#fafafa]/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-sm supports-[backdrop-filter]:bg-[#fafafa]/90">
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6"
        aria-label="Main"
      >
        <Link
          href="/"
          className="min-w-0 truncate text-[15px] font-medium tracking-[-0.02em] text-zinc-950 outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-600"
          onClick={closeMenu}
        >
          Trust Receipt
        </Link>

        <div className="hidden items-center gap-8 md:flex">
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

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="#app"
            className="hidden items-center justify-center rounded-md bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:inline-flex"
          >
            Get started
          </a>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id={menuId}
          className="border-t border-zinc-200/80 bg-[#fafafa] px-4 py-4 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-100"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#app"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              onClick={closeMenu}
            >
              Get started
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
