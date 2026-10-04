import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-chip font-bold uppercase tracking-[0.12em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red active:translate-y-px";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-red text-text shadow-[0_10px_30px_-12px_rgb(227_30_36/0.9)] hover:bg-brand-red-dark hover:shadow-[0_16px_38px_-12px_rgb(227_30_36/0.95)]",
  gold: "bg-brand-gold text-ink hover:bg-[#e0c400] shadow-[0_10px_30px_-14px_rgb(255_215_0/0.8)]",
  outline:
    "border border-brand-red/70 bg-brand-red/5 text-text hover:border-brand-red hover:bg-brand-red",
  ghost: "border border-line bg-white/[0.02] text-muted hover:border-brand-red/60 hover:text-text",
  danger: "border border-brand-red/60 text-brand-red hover:bg-brand-red hover:text-text",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-[11px]",
  md: "px-5 py-3 text-xs",
  lg: "px-7 py-4 text-sm",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  target,
  rel,
  ...rest
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
