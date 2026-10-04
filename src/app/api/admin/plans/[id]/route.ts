import { type NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  isValidObjectId,
  readJsonBody,
  requireAdmin,
} from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Member, Plan } from "@/models";
import { planInputSchema } from "@/lib/validation/schemas";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/plans/[id]">) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return apiError("Plan not found", 404);

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  // Partial update: the toggle button sends only `active`, the editor sends all.
  const patch = planInputSchema.partial().safeParse(data);
  if (!patch.success) {
    const [issue] = patch.error.issues;
    return apiError(issue?.message ?? "Could not update the plan", 400);
  }

  try {
    await connectToDatabase();
    const plan = await Plan.findByIdAndUpdate(id, { $set: patch.data }, { returnDocument: "after" }).lean();
    if (!plan) return apiError("Plan not found", 404);
    return apiSuccess({ ok: true });
  } catch (caught) {
    console.error("Plan update failed:", caught);
    return apiError("Could not update the plan. Please try again.", 500);
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/admin/plans/[id]">) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return apiError("Plan not found", 404);

  try {
    await connectToDatabase();
    const plan = await Plan.findById(id).lean();
    if (!plan) return apiError("Plan not found", 404);

    // Refuse while members still reference the plan by name, so nobody's
    // existing membership loses its label.
    const membersOnPlan = await Member.countDocuments({ currentPlanName: plan.name });
    if (membersOnPlan > 0) {
      return apiError(
        `${membersOnPlan} member(s) are on ${plan.name}. Deactivate it instead of deleting.`,
        409,
      );
    }

    await Plan.findByIdAndDelete(id);
    return apiSuccess({ ok: true });
  } catch (caught) {
    console.error("Plan delete failed:", caught);
    return apiError("Could not delete the plan. Please try again.", 500);
  }
}
