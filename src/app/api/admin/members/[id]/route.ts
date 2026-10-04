import { type NextRequest } from "next/server";
import { isValidObjectId, readJsonBody, requireAdmin, apiError, apiSuccess } from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Member } from "@/models";
import { memberPatchSchema } from "@/lib/validation/schemas";
import { calculateExpiryDate } from "@/lib/membership";
import { parseDateKey } from "@/lib/dates";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/members/[id]">) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return apiError("Member not found", 404);

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const parsed = memberPatchSchema.safeParse(data);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return apiError(issue?.message ?? "Could not update member", 400);
  }

  const update: Record<string, unknown> = { ...parsed.data };
  delete update.planId;

  try {
    await connectToDatabase();
    const existing = await Member.findById(id).lean();
    if (!existing) return apiError("Member not found", 404);

    // Changing the plan or joining date re-derives the expiry date. The owner
    // confirms this in the UI before it is sent.
    if (parsed.data.planId || parsed.data.joiningDate) {
      let months = existing.currentPlanMonths;
      let planName = existing.currentPlanName;
      let planPrice = existing.currentPlanPrice;
      let freeTrainingIncluded = existing.freeTrainingMonthIncluded;

      if (parsed.data.planId) {
        const { Plan } = await import("@/models");
        const plan = await Plan.findById(parsed.data.planId).lean();
        if (!plan) return apiError("Selected plan no longer exists", 400);
        months = plan.months;
        planName = plan.name;
        planPrice = plan.price;
        freeTrainingIncluded = plan.includesFreeTrainingMonth;
      }

      const joiningDate = parsed.data.joiningDate
        ? parseDateKey(parsed.data.joiningDate)
        : existing.joiningDate;

      if (!joiningDate) return apiError("Joining date is invalid", 400);

      update.joiningDate = joiningDate;
      update.currentPlanMonths = months;
      update.currentPlanName = planName;
      update.currentPlanPrice = planPrice;
      update.freeTrainingMonthIncluded = freeTrainingIncluded;
      update.expiryDate = calculateExpiryDate({
        joiningDate,
        months,
        currentExpiryDate: existing.expiryDate,
        mode: existing.expiryDate < new Date() ? "renew" : "new",
      });
      // A plan change restarts the free training month entitlement.
      if (parsed.data.planId) update.freeTrainingMonthUsed = false;
    }

    const member = await Member.findByIdAndUpdate(id, { $set: update }, { returnDocument: "after" }).lean();
    if (!member) return apiError("Member not found", 404);

    return apiSuccess({ ok: true, memberId: String(member._id) });
  } catch (caught) {
    if (caught && typeof caught === "object" && "code" in caught && caught.code === 11000) {
      return apiError("A member with this phone number already exists", 409);
    }
    console.error("Member update failed:", caught);
    return apiError("Could not update the member. Please try again.", 500);
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/admin/members/[id]">) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return apiError("Member not found", 404);

  try {
    await connectToDatabase();
    const { Payment, Attendance, MemberNote } = await import("@/models");

    // Member-owned records go with the member, otherwise the ledger keeps
    // pointing at documents that no longer exist.
    await Promise.all([
      Payment.deleteMany({ member: id }),
      Attendance.deleteMany({ member: id }),
      MemberNote.deleteMany({ member: id }),
    ]);

    const deleted = await Member.findByIdAndDelete(id);
    if (!deleted) return apiError("Member not found", 404);

    return apiSuccess({ ok: true });
  } catch (caught) {
    console.error("Member delete failed:", caught);
    return apiError("Could not delete the member. Please try again.", 500);
  }
}
