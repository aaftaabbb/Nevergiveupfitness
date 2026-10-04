"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { GymLogoLockup } from "@/components/brand/gym-logo";
import { brand, callHref } from "@/lib/brand";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#programs", label: "Programs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#cafe", label: "Café" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label={`${brand.name} home`} className="shrink-0">
          <GymLogoLockup />
        </Link>

        <nav className="hidden items-center gap-1 rounded-chip border border-white/5 bg-white/[0.03] p-1.5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-[0.5rem] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:bg-white/[0.06] hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={callHref}
            className="hidden items-center gap-2 rounded-chip border border-brand-red/60 bg-brand-red/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text transition-colors hover:bg-brand-red sm:flex"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {brand.phoneDisplay}
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="rounded-chip border border-white/10 bg-white/[0.03] p-2.5 text-text transition-colors hover:border-brand-red/60 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/5 bg-ink/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-chip px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:bg-white/[0.06] hover:text-text"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={callHref}
              className="mt-2 flex items-center justify-center gap-2 rounded-chip bg-brand-red px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-text"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              Call {brand.phoneDisplay}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}