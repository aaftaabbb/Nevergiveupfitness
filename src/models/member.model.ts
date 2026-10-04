import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * A gym member.
 *
 * Phase 2 note: `email`, `passwordHash` and `portalEnabled` are already part of
 * the document so the member portal can be added later without reshaping the
 * collection. They stay unset during phase 1.
 */
const memberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    age: { type: Number, default: null, min: 10, max: 100 },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    photoUrl: { type: String, default: "" },
    goal: { type: String, default: "" },

    joiningDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },

    currentPlanMonths: { type: Number, required: true, min: 1 },
    currentPlanName: { type: String, required: true },
    currentPlanPrice: { type: Number, required: true, min: 0 },
    /** Snapshot of the plan's free-training offer, kept so a later plan edit
     *  does not rewrite the promise already made to the member. */
    freeTrainingMonthIncluded: { type: Boolean, default: false },
    freeTrainingMonthUsed: { type: Boolean, default: false },

    /** Amount received but not applied, or billed and not yet paid. */
    dues: { type: Number, default: 0, min: 0 },
    duesNote: { type: String, default: "" },

    workoutPlan: { type: String, default: "" },
    dietPlan: { type: String, default: "" },
    notes: { type: String, default: "" },

    // Phase 2 member portal credentials.
    passwordHash: { type: String, default: null, select: false },
    portalEnabled: { type: Boolean, default: false },
    lastPortalLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

memberSchema.index({ name: "text", phone: "text" });
memberSchema.index({ expiryDate: 1 });

// Never let a password hash reach an API response by accident.
memberSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const rest: Record<string, unknown> = { ...ret };
    delete rest.passwordHash;
    delete rest.__v;
    return rest;
  },
});

export type MemberDoc = InferSchemaType<typeof memberSchema>;
export const Member = mongoose.models.Member ?? mongoose.model("Member", memberSchema);
