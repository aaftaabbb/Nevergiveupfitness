import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const PAYMENT_MODES = ["cash", "UPI"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

/**
 * One row per collection event. `amount` is what was agreed for that period;
 * `status` lets the owner record a promised payment and flip it to paid later.
 */
const paymentSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paidOn: { type: Date, required: true },
    mode: { type: String, enum: PAYMENT_MODES, required: true },
    status: { type: String, enum: ["paid", "pending"], default: "paid", index: true },
    /** Snapshot so history stays readable even after the member changes plan. */
    planMonths: { type: Number, default: 0 },
    planName: { type: String, default: "" },
    note: { type: String, default: "", maxlength: 200 },
    collectedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

paymentSchema.index({ paidOn: -1 });

export type PaymentDoc = InferSchemaType<typeof paymentSchema>;
export const Payment = mongoose.models.Payment ?? mongoose.model("Payment", paymentSchema);
