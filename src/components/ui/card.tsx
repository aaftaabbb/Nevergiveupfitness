import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  emphasis?: boolean;
  as?: "div" | "article" | "section" | "li";
};

export function Card({ children, className = "", emphasis = false, as: Tag = "div" }: CardProps) {
  return (
    <Tag className={`card ${emphasis ? "card-emphasis" : ""} ${className}`}>{children}</Tag>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      {eyebrow ? (
        <p className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>{eyebrow}</p>
      ) : null}
      <h2 className="mt-4 text-4xl text-text sm:text-5xl">{title}</h2>
      {description ? (
        <p
          className={`mt-4 max-w-2xl text-sm leading-relaxed text-muted ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
