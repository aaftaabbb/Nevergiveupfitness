import { type NextRequest } from "next/server";
import { apiError, apiSuccess, readJsonBody, requireAdmin } from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Member, Payment } from "@/models";
import { paymentInputSchema } from "@/lib/validation/schemas";
import { calculateExpiryDate } from "@/lib/membership";
import { parseDateKey } from "@/lib/dates";
import { isValidObjectId } from "@/lib/api/helpers";
import { Plan } from "@/models";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const parsed = paymentInputSchema.safeParse(data);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return apiError(issue?.message ?? "Could not record the payment", 400);
  }

  if (!isValidObjectId(parsed.data.memberId)) return apiError("Member not found", 404);

  const paidOn = parseDateKey(parsed.data.paidOn);
  if (!paidOn) return apiError("Payment date is invalid", 400);

  try {
    await connectToDatabase();
    const member = await Member.findById(parsed.data.memberId);
    if (!member) return apiError("Member not found", 404);

    const payment = await Payment.create({
      member: member._id,
      amount: parsed.data.amount,
      paidOn,
      mode: parsed.data.mode,
      status: parsed.data.status,
      planMonths: parsed.data.planMonths || member.currentPlanMonths,
      planName: parsed.data.planName || member.currentPlanName,
      note: parsed.data.note,
      collectedAt: parsed.data.status === "paid" ? new Date() : null,
    });

    // A paid membership payment pushes the expiry forward and clears dues. A
    // pending row is only a note, so the member's status must not move.
    if (parsed.data.status === "paid" && parsed.data.planMonths > 0) {
      const months = parsed.data.planMonths;
      const expiryDate = calculateExpiryDate({
        joiningDate: member.joiningDate,
        months,
        currentExpiryDate: member.expiryDate,
        mode: "renew",
      });
      member.expiryDate = expiryDate;
      member.currentPlanMonths = months;
      member.currentPlanName = parsed.data.planName || member.currentPlanName;
      // Keep the stored plan price in step with the plan table, so a renewal
      // never leaves the member showing last season's price.
      if (parsed.data.planName) {
        const plan = await Plan.findOne({ name: parsed.data.planName }).lean();
        if (plan) member.currentPlanPrice = plan.price;
      }
      if (member.dues > 0) {
        member.dues = Math.max(0, member.dues - parsed.data.amount);
        if (member.dues === 0) member.duesNote = "";
      }
    } else if (parsed.data.status === "paid" && member.dues > 0) {
      member.dues = Math.max(0, member.dues - parsed.data.amount);
      if (member.dues === 0) member.duesNote = "";
    }

    await member.save();

    return apiSuccess({ ok: true, paymentId: payment._id.toString() }, 201);
  } catch (caught) {
    console.error("Payment create failed:", caught);
    return apiError("Could not record the payment. Please try again.", 500);
  }
}

/** Flips a pending row to paid, used by the "Mark as Paid" button. */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const paymentId = (data as { paymentId?: string } | null)?.paymentId;
  if (!paymentId || !isValidObjectId(paymentId)) return apiError("Payment not found", 404);

  try {
    await connectToDatabase();
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: { status: "paid", collectedAt: new Date() } },
      { returnDocument: "after" },
    ).lean();

    if (!payment) return apiError("Payment not found", 404);

    const member = await Member.findById(payment.member);
    if (member && member.dues > 0) {
      member.dues = Math.max(0, member.dues - payment.amount);
      if (member.dues === 0) member.duesNote = "";
      await member.save();
    }

    return apiSuccess({ ok: true });
  } catch (caught) {
    console.error("Payment update failed:", caught);
    return apiError("Could not update the payment. Please try again.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const paymentId = request.nextUrl.searchParams.get("id");
  if (!paymentId || !isValidObjectId(paymentId)) return apiError("Payment not found", 404);

  try {
    await connectToDatabase();
    const deleted = await Payment.findByIdAndDelete(paymentId);
    if (!deleted) return apiError("Payment not found", 404);
    return apiSuccess({ ok: true });
  } catch (caught) {
    console.error("Payment delete failed:", caught);
    return apiError("Could not delete the payment. Please try again.", 500);
  }
}
