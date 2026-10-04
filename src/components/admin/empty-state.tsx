import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card hatch flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Inbox className="h-8 w-8 text-muted" aria-hidden />
      <p className="font-display text-2xl text-text">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export function InlineNotice({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const toneClass = {
    error: "border-brand-red text-brand-red",
    success: "border-status-active text-status-active",
    info: "border-line text-muted",
  }[tone];

  return (
    <p role="status" className={`border-l-4 bg-surface px-3 py-2 text-xs ${toneClass}`}>
      {children}
    </p>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse bg-surface" />
      ))}
    </div>
  );
}
