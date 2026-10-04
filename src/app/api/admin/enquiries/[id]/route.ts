import { type NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  isValidObjectId,
  readJsonBody,
  requireAdmin,
} from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Enquiry } from "@/models";
import { enquiryStatusSchema } from "@/lib/validation/schemas";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/enquiries/[id]">) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return apiError("Enquiry not found", 404);

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const parsed = enquiryStatusSchema.safeParse(data);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return apiError(issue?.message ?? "Could not update the enquiry", 400);
  }

  try {
    await connectToDatabase();
    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      {
        $set: {
          status: parsed.data.status,
          handledNote: parsed.data.handledNote,
          handledAt: new Date(),
        },
      },
      { returnDocument: "after" },
    ).lean();

    if (!enquiry) return apiError("Enquiry not found", 404);
    return apiSuccess({ ok: true, status: enquiry.status });
  } catch (caught) {
    console.error("Enquiry update failed:", caught);
    return apiError("Could not update the enquiry. Please try again.", 500);
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/admin/enquiries/[id]">) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return apiError("Enquiry not found", 404);

  try {
    await connectToDatabase();
    const result = await Enquiry.findByIdAndDelete(id);
    if (!result) return apiError("Enquiry not found", 404);
    return apiSuccess({ ok: true });
  } catch (caught) {
    console.error("Enquiry delete failed:", caught);
    return apiError("Could not delete the enquiry. Please try again.", 500);
  }
}