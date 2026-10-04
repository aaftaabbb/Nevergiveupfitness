import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess, isValidObjectId, readJsonBody, requireAdmin } from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Member, Plan } from "@/models";
import { calculateExpiryDate } from "@/lib/membership";

const renewSchema = z
  .object({
    /** Manual extension in months. Omitted when renewing onto a plan. */
    months: z.coerce.number().int().min(1, "Add at least one month").max(36).optional(),
    /** Optional plan switch at the same time as the extension. */
    planId: z.string().optional(),
  })
  .refine((value) => value.months !== undefined || Boolean(value.planId), {
    message: "Add at least one month",
  });

/**
 * Extends a membership without recording a payment. The owner often agrees a
 * renewal over WhatsApp and collects cash at the desk, so extension and payment
 * recording are deliberately separate actions.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/admin/members/[id]/renew">) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return apiError("Member not found", 404);

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const parsed = renewSchema.safeParse(data);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return apiError(issue?.message ?? "Could not extend the membership", 400);
  }

  try {
    await connectToDatabase();
    const member = await Member.findById(id);
    if (!member) return apiError("Member not found", 404);

    let months = parsed.data.months;
    if (parsed.data.planId) {
      if (!isValidObjectId(parsed.data.planId)) return apiError("Plan not found", 404);
      const plan = await Plan.findById(parsed.data.planId).lean();
      if (!plan) return apiError("Plan not found", 404);

      // Picking a plan means renewing for that plan's full duration.
      months = plan.months;
      member.currentPlanMonths = plan.months;
      member.currentPlanName = plan.name;
      member.currentPlanPrice = plan.price;
      member.freeTrainingMonthIncluded = plan.includesFreeTrainingMonth;
      // A new plan restarts the free training month entitlement.
      member.freeTrainingMonthUsed = false;
    }

    if (!months) return apiError("Add at least one month", 400);

    member.expiryDate = calculateExpiryDate({
      joiningDate: member.joiningDate,
      months,
      currentExpiryDate: member.expiryDate,
      mode: "renew",
    });

    await member.save();

    return apiSuccess({ ok: true, expiryDate: member.expiryDate.toISOString() });
  } catch (caught) {
    console.error("Renewal failed:", caught);
    return apiError("Could not extend the membership. Please try again.", 500);
  }
}
