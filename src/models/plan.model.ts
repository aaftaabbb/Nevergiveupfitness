import mongoose, { Schema, type InferSchemaType } from "mongoose";

/** 1 / 3 / 6 / 12 month memberships. Yearly plans carry the free PT offer. */
const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    months: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    highlight: { type: String, default: "" },
    features: { type: [String], default: [] },
    /**
     * Set on the yearly plan so the owner sees the free personal training,
     * diet plan, body analysis and fitness test note on every assignment.
     */
    includesFreeTrainingMonth: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

planSchema.index({ months: 1 });
planSchema.index({ sortOrder: 1 });

export type PlanDoc = InferSchemaType<typeof planSchema>;
export const Plan = mongoose.models.Plan ?? mongoose.model("Plan", planSchema);
