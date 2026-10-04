import { z } from "zod";

/** Indian mobile numbers, stored as 10 digits without the country code. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""))
  .refine((digits) => /^[6-9]\d{9}$/.test(digits), {
    message: "Enter a valid 10 digit Indian mobile number",
  });

export const memberInputSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .max(120)
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address",
    })
    .default(""),
  age: z.coerce.number().int().min(10).max(100).nullable().optional(),
  gender: z.enum(["male", "female", "other", ""]).default(""),
  photoUrl: z.string().trim().max(2_000_000).default(""),
  goal: z.string().trim().max(120).default(""),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Joining date is required"),
  planId: z.string().min(1, "Select a plan"),
  dues: z.coerce.number().min(0).default(0),
  duesNote: z.string().trim().max(200).default(""),
  workoutPlan: z.string().trim().max(4000).default(""),
  dietPlan: z.string().trim().max(4000).default(""),
  notes: z.string().trim().max(2000).default(""),
});

export type MemberInput = z.infer<typeof memberInputSchema>;

export const memberPatchSchema = memberInputSchema
  .partial()
  .extend({ freeTrainingMonthUsed: z.boolean().optional() })
  .refine((value) => Object.keys(value).length > 0, { message: "Nothing to update" });

export const paymentInputSchema = z.object({
  memberId: z.string().min(1),
  amount: z.coerce.number().int().min(1, "Amount must be at least ₹1").max(100_000),
  paidOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  mode: z.enum(["cash", "UPI"]),
  status: z.enum(["paid", "pending"]).default("paid"),
  planMonths: z.coerce.number().int().min(0).max(60).default(0),
  planName: z.string().trim().max(60).default(""),
  note: z.string().trim().max(200).default(""),
});

export const attendanceInputSchema = z.object({
  memberId: z.string().min(1, "Pick a member"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
});

export const memberNoteInputSchema = z.object({
  memberId: z.string().min(1),
  body: z.string().trim().min(1, "Write something first").max(1000),
});

export const planInputSchema = z.object({
  name: z.string().trim().min(2).max(40),
  months: z.coerce.number().int().min(1).max(36),
  price: z.coerce.number().int().min(0).max(200_000),
  highlight: z.string().trim().max(120).default(""),
  features: z.array(z.string().trim().max(120)).max(10).default([]),
  includesFreeTrainingMonth: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const enquiryInputSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .max(120)
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address",
    })
    .default(""),
  interest: z.string().trim().max(80).default(""),
  message: z.string().trim().max(600).default(""),
  // Honeypot: bots fill hidden inputs, humans never see it.
  company: z.string().max(0).optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username").max(60),
  password: z.string().min(1, "Enter your password").max(200),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "converted", "dropped"]),
  handledNote: z.string().trim().max(400).default(""),
});

/** Flattens a ZodError into a field -> first message map, for the admin forms. */
export function fieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}
