import mongoose, { Schema, type InferSchemaType } from "mongoose";

/** Scratch pad for the trainer: form corrections, call notes, anything quick. */
const memberNoteSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    body: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true },
);

memberNoteSchema.index({ member: 1, createdAt: -1 });

export type MemberNoteDoc = InferSchemaType<typeof memberNoteSchema>;
export const MemberNote =
  mongoose.models.MemberNote ?? mongoose.model("MemberNote", memberNoteSchema);
