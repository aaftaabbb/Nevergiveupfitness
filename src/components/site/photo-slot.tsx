import { ImageIcon } from "lucide-react";

type PhotoSlotProps = {
  label: string;
  className?: string;
};

/**
 * Placeholder for a real gym photo. Swap these for next/image once the owner
 * drops actual photos into public/images, so the site never ships stock images
 * of somebody else's gym.
 */
export function PhotoSlot({ label, className = "" }: PhotoSlotProps) {
  return (
    <div
      className={`hatch relative flex items-center justify-center overflow-hidden rounded-panel border border-line/80 p-4 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 50% 0%, rgba(227,30,36,0.14), transparent 60%)",
        }}
        aria-hidden
      />
      <span className="relative flex flex-col items-center gap-2 text-center">
        <ImageIcon className="h-6 w-6 text-brand-red/70" aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          {label}
        </span>
      </span>
    </div>
  );
}