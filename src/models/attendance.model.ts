import mongoose, { Schema, type InferSchemaType } from "mongoose";

/** One row per member per day. `date` is the YYYY-MM-DD key in IST. */
const attendanceSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    date: { type: String, required: true },
    markedBy: { type: String, enum: ["owner", "self"], default: "owner" },
  },
  { timestamps: true },
);

// A member can only be marked present once a day, even on a double tap.
attendanceSchema.index({ member: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: -1 });

export type AttendanceDoc = InferSchemaType<typeof attendanceSchema>;
export const Attendance =
  mongoose.models.Attendance ?? mongoose.model("Attendance", attendanceSchema);
