import type { SVGProps } from "react";

/**
 * Placeholder brand mark: a circular badge with the gym name curved around a
 * dumbbell icon. The owner will replace this with the designed logo before
 * launch, so every usage points at this single component.
 */
export function GymLogo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Never Give Up Fitness logo"
      className={className}
      {...props}
    >
      <title>Never Give Up Fitness</title>
      <defs>
        <path
          id="nguf-badge-arc"
          d="M 100,100 m -74,0 a 74,74 0 1,1 148,0 a 74,74 0 1,1 -148,0"
          fill="none"
        />
      </defs>

      <circle cx="100" cy="100" r="98" fill="#0D0D0D" />
      <circle
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="#E31E24"
        strokeWidth="4"
      />
      <circle
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke="#E31E24"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      <text
        fill="#F5F5F2"
        fontFamily="var(--font-display), Arial Narrow, sans-serif"
        fontSize="26"
        letterSpacing="2.5"
      >
        <textPath href="#nguf-badge-arc" startOffset="25%" textAnchor="middle">
          NEVER GIVE UP
        </textPath>
      </text>

      {/* Dumbbell glyph: bar, inner collars, outer plates. */}
      <g transform="translate(100 104)">
        <rect x="-8" y="-4" width="16" height="8" fill="#F5F5F2" />
        <rect x="-20" y="-13" width="9" height="26" fill="#F5F5F2" />
        <rect x="11" y="-13" width="9" height="26" fill="#F5F5F2" />
        <rect x="-32" y="-20" width="9" height="40" fill="#E31E24" />
        <rect x="23" y="-20" width="9" height="40" fill="#E31E24" />
      </g>

      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill="#FFD700"
        fontFamily="var(--font-body), sans-serif"
        fontWeight="700"
        fontSize="13"
        letterSpacing="3"
      >
        FITNESS
      </text>
    </svg>
  );
}

/** Horizontal lockup for the site header, where a circle would cost too much height. */
export function GymLogoLockup({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className ?? ""}`}>
      <GymLogo className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-2xl text-text">Never Give Up</span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red">
          Strength &amp; Devotion
        </span>
      </span>
    </span>
  );
}
