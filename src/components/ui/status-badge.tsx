import type { ReactNode } from "react";
import type { MembershipStatus } from "@/lib/membership";

const styles: Record<string, string> = {
  active: "border-status-active/60 text-status-active bg-status-active/10",
  expiring: "border-status-expiring/60 text-status-expiring bg-status-expiring/10",
  expired: "border-status-expired/60 text-status-expired bg-status-expired/10",
  paid: "border-status-active/60 text-status-active bg-status-active/10",
  pending: "border-status-expiring/60 text-status-expiring bg-status-expiring/10",
  new: "border-brand-red/60 text-brand-red bg-brand-red/10",
  contacted: "border-line text-muted bg-surface-raised",
  converted: "border-status-active/60 text-status-active bg-status-active/10",
  dropped: "border-line text-muted bg-surface-raised",
};

export function StatusBadge({
  status,
  label,
}: {
  status: MembershipStatus | string;
  label?: string;
}) {
  const text = label ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
        styles[status] ?? styles.contacted
      }`}
    >
      {text}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "red" }) {
  const toneClass =
    tone === "gold"
      ? "border-brand-gold/50 text-brand-gold"
      : tone === "red"
        ? "border-brand-red/50 text-brand-red"
        : "border-line text-muted";
  return (
    <span className={`inline-block border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClass}`}>
      {children}
    </span>
  );
}
