import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Enquiry } from "@/models";
import { enquiryInputSchema } from "@/lib/validation/schemas";
import { clientKeyFromHeaders, rateLimit } from "@/lib/auth/rate-limit";

/**
 * Public endpoint. Generous on purpose: many visitors share one NAT address on
 * mobile data or gym wifi, and a marketing form must not lock out a real lead.
 */
const ENQUIRY_LIMIT = 20;
const ENQUIRY_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const limit = rateLimit(
    `enquiry:${clientKeyFromHeaders(request.headers)}`,
    ENQUIRY_LIMIT,
    ENQUIRY_WINDOW_MS,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests from this device. Please call us on 99702 49993." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = enquiryInputSchema.safeParse(body);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    return NextResponse.json(
      { error: issue?.message ?? "Please check the form and try again" },
      { status: 400 },
    );
  }

  // Honeypot tripped: accept silently so the bot does not retry with variations.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  try {
    await connectToDatabase();
    const enquiry = await Enquiry.create({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      interest: parsed.data.interest,
      message: parsed.data.message,
      source: "website",
    });

    return NextResponse.json(
      { ok: true, reference: enquiry._id.toString(), windowMs: ENQUIRY_WINDOW_MS },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not save enquiry:", error);
    return NextResponse.json(
      { error: "We could not save your request. Please WhatsApp us on 99702 49993." },
      { status: 500 },
    );
  }
}
