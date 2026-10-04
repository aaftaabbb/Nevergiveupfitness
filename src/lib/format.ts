const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Indian grouped rupees, e.g. ₹12,000 */
export function formatRupees(amount: number) {
  return inrFormatter.format(Math.round(amount || 0));
}

/** Indian digit grouping without the symbol, for table cells and CSV. */
export function formatRupeesPlain(amount: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(amount || 0),
  );
}

/** 9970249993 -> +91 99702 49993 */
export function formatPhone(raw?: string | null) {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return raw;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "NG";
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
