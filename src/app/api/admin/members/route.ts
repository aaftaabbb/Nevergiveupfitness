import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess, readJsonBody, requireAdmin } from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Member, Payment } from "@/models";
import { memberInputSchema } from "@/lib/validation/schemas";
import { calculateExpiryDate, membershipStatusOf } from "@/lib/membership";
import { formatRupeesPlain } from "@/lib/format";
import { formatDate, parseDateKey, toDateKey } from "@/lib/dates";

/** Optional joining payment captured in the same request as the new member. */
const createMemberSchema = memberInputSchema.extend({
  amount: z.coerce.number().min(0).max(200_000).default(0),
  mode: z.enum(["cash", "UPI"]).default("cash"),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const parsed = createMemberSchema.safeParse(data);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return apiError(issue?.message ?? "Could not save the member", 400);
  }

  const joiningDate = parseDateKey(parsed.data.joiningDate);
  if (!joiningDate) return apiError("Joining date is invalid", 400);

  try {
    await connectToDatabase();
    const { Plan } = await import("@/models");
    const plan = await Plan.findById(parsed.data.planId).lean();
    if (!plan) return apiError("Selected plan no longer exists", 400);

    const expiryDate = calculateExpiryDate({
      joiningDate,
      months: plan.months,
      mode: "new",
    });

    const member = await Member.create({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      age: parsed.data.age ?? null,
      gender: parsed.data.gender,
      photoUrl: parsed.data.photoUrl,
      goal: parsed.data.goal,
      joiningDate,
      expiryDate,
      currentPlanMonths: plan.months,
      currentPlanName: plan.name,
      currentPlanPrice: plan.price,
      freeTrainingMonthIncluded: plan.includesFreeTrainingMonth,
      dues: parsed.data.dues,
      duesNote: parsed.data.duesNote,
      workoutPlan: parsed.data.workoutPlan,
      dietPlan: parsed.data.dietPlan,
      notes: parsed.data.notes,
    });

    // A joining payment is the common case, so the form offers to log it in the
    // same request instead of making the owner re-enter everything.
    if (parsed.data.amount > 0) {
      await Payment.create({
        member: member._id,
        amount: parsed.data.amount,
        paidOn: joiningDate,
        mode: parsed.data.mode,
        status: "paid",
        planMonths: plan.months,
        planName: plan.name,
        note: "Joining payment",
        collectedAt: new Date(),
      });
      if (parsed.data.amount < plan.price) {
        await Member.updateOne(
          { _id: member._id },
          { $set: { dues: plan.price - parsed.data.amount, duesNote: "Balance after joining" } },
        );
      }
    }

    return apiSuccess({ ok: true, memberId: member._id.toString() }, 201);
  } catch (caught) {
    if (caught && typeof caught === "object" && "code" in caught && caught.code === 11000) {
      return apiError("A member with this phone number already exists", 409);
    }
    console.error("Member create failed:", caught);
    return apiError("Could not save the member. Please try again.", 500);
  }
}

const CSV_HEADERS = [
  "Name",
  "Phone",
  "Age",
  "Gender",
  "Goal",
  "Plan",
  "Joining Date",
  "Expiry Date",
  "Status",
  "Dues (INR)",
  "Total Paid (INR)",
  "Workout Plan",
  "Diet Plan",
  "Notes",
];

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  // Guard against spreadsheet formula injection from free text fields.
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    await connectToDatabase();
    const members = await Member.find({})
      .select("name phone age gender goal currentPlanName currentPlanMonths joiningDate expiryDate dues workoutPlan dietPlan notes")
      .sort({ name: 1 })
      .lean();

    const totals = await Payment.aggregate<{ _id: unknown; total: number }>([
      { $match: { status: "paid" } },
      { $group: { _id: "$member", total: { $sum: "$amount" } } },
    ]);
    const paidByMember = new Map(totals.map((row) => [String(row._id), row.total]));

    const rows = members.map((member) => {
      const status = membershipStatusOf({ expiryDate: member.expiryDate, dues: member.dues });
      return [
        member.name,
        member.phone,
        member.age ?? "",
        member.gender ?? "",
        member.goal ?? "",
        member.currentPlanName,
        formatDate(member.joiningDate),
        formatDate(member.expiryDate),
        status.status,
        formatRupeesPlain(member.dues),
        formatRupeesPlain(paidByMember.get(String(member._id)) ?? 0),
        member.workoutPlan,
        member.dietPlan,
        member.notes,
      ].map(csvCell).join(",");
    });

    const csv = [CSV_HEADERS.join(","), ...rows].join("\r\n");
    const stamp = toDateKey(new Date());

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="nguf-members-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (caught) {
    console.error("CSV export failed:", caught);
    return apiError("Could not export members right now.", 500);
  }
}
