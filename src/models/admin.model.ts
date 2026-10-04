import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * Single-owner admin account. The role field exists so the phase 2 member
 * portal can reuse the same session shape without a migration.
 */
const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner"], default: "owner" },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Belt and braces alongside `select: false`: even a document fetched with an
// explicit projection cannot serialise the hash.
adminSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const rest: Record<string, unknown> = { ...ret };
    delete rest.passwordHash;
    delete rest.__v;
    return rest;
  },
});

export type AdminDoc = InferSchemaType<typeof adminSchema>;
export const Admin = mongoose.models.Admin ?? mongoose.model("Admin", adminSchema);
