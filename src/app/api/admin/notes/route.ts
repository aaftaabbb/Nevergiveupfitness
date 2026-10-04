import { type NextRequest } from "next/server";
import { apiError, apiSuccess, isValidObjectId, readJsonBody, requireAdmin } from "@/lib/api/helpers";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Member, MemberNote } from "@/models";
import { memberNoteInputSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { data, error } = await readJsonBody(request);
  if (error) return error;

  const parsed = memberNoteInputSchema.safeParse(data);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return apiError(issue?.message ?? "Could not save the note", 400);
  }

  if (!isValidObjectId(parsed.data.memberId)) return apiError("Member not found", 404);

  try {
    await connectToDatabase();
    const memberExists = await Member.exists({ _id: parsed.data.memberId });
    if (!memberExists) return apiError("Member not found", 404);

    const note = await MemberNote.create({
      member: parsed.data.memberId,
      body: parsed.data.body,
    });

    return apiSuccess({ ok: true, noteId: note._id.toString() }, 201);
  } catch (caught) {
    console.error("Note create failed:", caught);
    return apiError("Could not save the note. Please try again.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const noteId = request.nextUrl.searchParams.get("id");
  if (!noteId || !isValidObjectId(noteId)) return apiError("Note not found", 404);

  try {
    await connectToDatabase();
    const deleted = await MemberNote.findByIdAndDelete(noteId);
    if (!deleted) return apiError("Note not found", 404);
    return apiSuccess({ ok: true });
  } catch (caught) {
    console.error("Note delete failed:", caught);
    return apiError("Could not delete the note. Please try again.", 500);
  }
}
