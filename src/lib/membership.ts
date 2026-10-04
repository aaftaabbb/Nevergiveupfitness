import { connectToDatabase } from "@/lib/db/mongoose";
import { addMonths, daysUntil, todayIst } from "@/lib/dates";

export const MEMBERSHIP_STATUSES = ["active", "expiring", "expired"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/** A membership inside this window shows as gold "Expiring" in the admin list. */
export const EXPIRING_WINDOW_DAYS = 7;

export type MemberLike = {
  expiryDate: Date;
  dues?: number;
};

export function membershipStatus(
  expiryDate: Date,
  now: Date = new Date(),
): MembershipStatus {
  const remaining = daysUntil(expiryDate, now);
  if (remaining < 0) return "expired";
  if (remaining <= EXPIRING_WINDOW_DAYS) return "expiring";
  return "active";
}

export function membershipStatusOf(member: MemberLike, now: Date = new Date()) {
  const status = membershipStatus(member.expiryDate, now);
  return {
    status,
    daysRemaining: daysUntil(member.expiryDate, now),
    hasDues: (member.dues ?? 0) > 0,
  };
}

/**
 * Expiry on assignment: a new join runs from the joining date, a renewal runs
 * from whichever is later, the current expiry or today. Renewing early therefore
 * never shortens a member's membership.
 */
export function calculateExpiryDate(input: {
  joiningDate: Date;
  months: number;
  currentExpiryDate?: Date | null;
  mode: "new" | "renew";
  now?: Date;
}) {
  const now = input.now ?? new Date();
  if (input.mode === "renew" && input.currentExpiryDate) {
    const base =
      input.currentExpiryDate.getTime() > todayIst(now).getTime()
        ? input.currentExpiryDate
        : todayIst(now);
    return addMonths(base, input.months);
  }
  return addMonths(input.joiningDate, input.months);
}

export function renewalMessage(memberName: string, expiryDate: Date, gymPhone: string) {
  return (
    `Hello ${memberName}, this is a reminder from Never Give Up Fitness. ` +
    `Your membership is valid till ${expiryDate.toLocaleDateString("en-GB")}. ` +
    `Renew it before it expires to keep your slot and your current plan. ` +
    `Call or WhatsApp ${gymPhone}.`
  );
}

export async function withDatabase<T>(operation: () => Promise<T>): Promise<T> {
  await connectToDatabase();
  return operation();
}
