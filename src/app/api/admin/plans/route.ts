import { type NextRequest } from "next/server";
import { apiError, apiSuccess, readJsonBody, requireAdmin } from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Plan } from "@/models";
import { planInputSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const parsed = planInputSchema.safeParse(data);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return apiError(issue?.message ?? "Could not save the plan", 400);
  }

  try {
    await connectToDatabase();
    // New plans go to the end of the pricing table.
    const count = await Plan.countDocuments({});
    const plan = await Plan.create({ ...parsed.data, sortOrder: count + 1 });
    return apiSuccess({ ok: true, planId: plan._id.toString() }, 201);
  } catch (caught) {
    console.error("Plan create failed:", caught);
    return apiError("Could not save the plan. Please try again.", 500);
  }
}
