import type { LucideIcon } from "lucide-react";
import { formatRupees } from "@/lib/format";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "gold" | "red" | "green";
  href?: string;
};

const toneClass = {
  default: "text-text",
  gold: "text-brand-gold",
  red: "text-brand-red",
  green: "text-status-active",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  href,
}: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden /> : null}
      </div>
      <p className={`mt-3 font-display text-4xl leading-none ${toneClass[tone]}`}>{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <a href={href} className="card block p-4 transition-colors hover:border-brand-red">
        {content}
      </a>
    );
  }

  return <div className="card p-4">{content}</div>;
}

export function CollectionCard({ amount }: { amount: number }) {
  return (
    <div className="card card-emphasis p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
        Collected this month
      </p>
      <p className="mt-3 font-display text-4xl leading-none text-brand-gold">
        {formatRupees(amount)}
      </p>
    </div>
  );
}
