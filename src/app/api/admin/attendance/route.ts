import { type NextRequest } from "next/server";
import { apiError, apiSuccess, readJsonBody, requireAdmin } from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Attendance, Member } from "@/models";
import { attendanceInputSchema } from "@/lib/validation/schemas";

/**
 * One tap marks present, a second tap on the same day removes the entry. This
 * keeps the gym floor usable with a phone that may have a cracked screen.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const parsed = attendanceInputSchema.safeParse(data);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return apiError(issue?.message ?? "Could not save attendance", 400);
  }

  const { memberId, date } = parsed.data;

  try {
    await connectToDatabase();

    const member = await Member.findById(memberId).select("name expiryDate").lean();
    if (!member) return apiError("Member not found", 404);

    const existing = await Attendance.findOne({ member: memberId, date }).lean();

    if (existing) {
      await Attendance.deleteOne({ _id: existing._id });
      const count = await Attendance.countDocuments({ date });
      return apiSuccess({ present: false, count });
    }

    await Attendance.create({ member: memberId, date });
    const count = await Attendance.countDocuments({ date });
    return apiSuccess({ present: true, count });
  } catch (caught) {
    console.error("Attendance toggle failed:", caught);
    return apiError("Could not save attendance. Please try again.", 500);
  }
}