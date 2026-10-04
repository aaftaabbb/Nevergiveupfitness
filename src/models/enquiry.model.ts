import mongoose, { Schema, type InferSchemaType } from "mongoose";

/** Free trial / walk-in requests coming from the public site. */
const enquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    interest: { type: String, default: "" },
    message: { type: String, default: "", maxlength: 600 },
    source: { type: String, default: "website" },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "dropped"],
      default: "new",
      index: true,
    },
    handledNote: { type: String, default: "", maxlength: 400 },
    handledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

enquirySchema.index({ createdAt: -1 });

export type EnquiryDoc = InferSchemaType<typeof enquirySchema>;
export const Enquiry = mongoose.models.Enquiry ?? mongoose.model("Enquiry", enquirySchema);
