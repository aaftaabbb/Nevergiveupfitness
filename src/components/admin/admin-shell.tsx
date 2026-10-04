"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  Gauge,
  Inbox,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { GymLogo } from "@/components/brand/gym-logo";
import { brand } from "@/lib/brand";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/plans", label: "Plans", icon: ClipboardList },
  { href: "/admin/payments", label: "Payments", icon: Dumbbell },
  { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
];

export function AdminShell({
  children,
  ownerName,
}: {
  children: React.ReactNode;
  ownerName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setNavOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 border-l-4 px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] transition-colors ${
              active
                ? "border-brand-red bg-brand-red/10 text-text"
                : "border-transparent text-muted hover:bg-surface hover:text-text"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Phone header: brand plus menu button, sticky while scrolling. */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-ink px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <GymLogo className="h-9 w-9" />
          <span className="font-display text-xl leading-none text-text">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setNavOpen((open) => !open)}
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
          className="border border-line p-2.5 text-text"
        >
          {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {navOpen ? (
        <div className="sticky top-[57px] z-30 border-b border-line bg-surface px-2 py-3 lg:hidden">
          {navLinks}
          <div className="mt-3 border-t border-line px-4 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Signed in as {ownerName}
            </p>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="mt-2 flex w-full items-center justify-center gap-2 border border-line py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:border-brand-red hover:text-text"
            >
              <LogOut className="h-3.5 w-3.5" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <GymLogo className="h-11 w-11" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl text-text">Never Give Up</span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-brand-red">
                {brand.tagline}
              </span>
            </span>
          </Link>
        </div>

        <div className="flex-1 py-4">{navLinks}</div>

        <div className="border-t border-line px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            Signed in as
          </p>
          <p className="mt-1 text-sm text-text">{ownerName}</p>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-line py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted transition-colors hover:border-brand-red hover:text-text"
          >
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
