/**
 * Date helpers pinned to IST.
 *
 * The gym runs on IST and Vercel servers run on UTC, so "today" must never be
 * derived from the machine clock. Every helper here works in Asia/Kolkata.
 */

export const TIME_ZONE = "Asia/Kolkata";

const IST_OFFSET_MINUTES = 330;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function istParts(reference: Date) {
  const shifted = new Date(reference.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
  };
}

function istMidnightUtc(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day) - IST_OFFSET_MINUTES * 60 * 1000);
}

/** Today in IST, as a Date pinned to the start of that day. */
export function todayIst(now: Date = new Date()) {
  const { year, month, day } = istParts(now);
  return istMidnightUtc(year, month, day);
}

/** YYYY-MM-DD in IST. Stored as the canonical key for attendance days. */
export function toDateKey(value: Date): string {
  const { year, month, day } = istParts(value);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addDays(value: Date, days: number) {
  const { year, month, day } = istParts(value);
  return istMidnightUtc(year, month, day + days);
}

/**
 * Adds calendar months while keeping the IST day-of-month.
 * 31 Jan + 1 month would otherwise roll into March, so it clamps to month end.
 */
export function addMonths(value: Date, months: number) {
  const { year, month, day } = istParts(value);
  const targetMonthIndex = month + months;
  const firstOfTarget = new Date(Date.UTC(year, targetMonthIndex, 1));
  const daysInTargetMonth = new Date(
    Date.UTC(firstOfTarget.getUTCFullYear(), firstOfTarget.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const clampedDay = Math.min(day, daysInTargetMonth);
  return istMidnightUtc(
    firstOfTarget.getUTCFullYear(),
    firstOfTarget.getUTCMonth(),
    clampedDay,
  );
}

/** DD/MM/YYYY */
export function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const { year, month, day } = istParts(date);
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
}

/** DD/MM/YYYY HH:mm in IST, used for payments and timestamps. */
export function formatDateTime(value?: Date | string | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const ist = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  const time = `${String(ist.getUTCHours()).padStart(2, "0")}:${String(ist.getUTCMinutes()).padStart(2, "0")}`;
  return `${formatDate(date)} ${time}`;
}

export function formatMonthYear(value?: Date | string | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const { year, month } = istParts(date);
  return `${MONTH_LABELS[month]} ${year}`;
}

/**
 * Whole days from today until the given date. Negative once the date is past.
 */
export function daysUntil(value: Date, now: Date = new Date()) {
  const start = todayIst(now).getTime();
  const { year, month, day } = istParts(value);
  const target = istMidnightUtc(year, month, day).getTime();
  return Math.round((target - start) / 86_400_000);
}

/** First and last instant of the current IST month, used for monthly collection. */
export function currentIstMonthRange(now: Date = new Date()) {
  const { year, month } = istParts(now);
  return {
    from: istMidnightUtc(year, month, 1),
    to: istMidnightUtc(year, month + 1, 1),
  };
}

/** Parse a YYYY-MM-DD key (from a date input) into an IST midnight Date. */
export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return null;
  return istMidnightUtc(year, month - 1, day);
}

export const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Today as YYYY-MM-DD in IST. */
export function todayKey(now: Date = new Date()) {
  return toDateKey(now);
}

/** Guards query params: "2026-2-9" from a hand typed URL must not reach the DB. */
export function isValidDateKey(value: string) {
  if (!DATE_KEY_PATTERN.test(value)) return false;
  const parsed = parseDateKey(value);
  if (!parsed) return false;
  return toDateKey(parsed) === value;
}

/** Shifts a YYYY-MM-DD key by whole days, staying on the calendar in IST. */
export function addDaysToKey(key: string, days: number) {
  const parsed = parseDateKey(key);
  if (!parsed) return key;
  return toDateKey(addDays(parsed, days));
}

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** "Monday, 01 Feb 2026" for attendance headers. */
export function formatDateLong(value?: Date | string | null) {
  if (!value) return "—";
  if (typeof value === "string" && DATE_KEY_PATTERN.test(value)) {
    const parsed = parseDateKey(value);
    if (!parsed) return "—";
    return formatLongFromParts(parsed);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return formatLongFromParts(date);
}

function formatLongFromParts(date: Date) {
  const { year, month, day } = istParts(date);
  const weekday = new Date(Date.UTC(year, month, day)).getUTCDay();
  return `${WEEKDAY_LABELS[weekday]}, ${String(day).padStart(2, "0")} ${
    MONTH_LABELS[month]
  } ${year}`;
}
