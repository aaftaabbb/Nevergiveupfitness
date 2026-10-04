import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Admin } from "@/models";
import { loginSchema } from "@/lib/validation/schemas";
import { clientKeyFromHeaders, rateLimit } from "@/lib/auth/rate-limit";
import { setSessionCookie } from "@/lib/auth/session";

const LOCKOUT_ATTEMPTS = 8;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const limit = rateLimit(
    `login:${clientKeyFromHeaders(request.headers)}`,
    LOCKOUT_ATTEMPTS,
    LOCKOUT_WINDOW_MS,
  );
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${minutes} minute(s).` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter both username and password" },
      { status: 400 },
    );
  }

  const { username, password } = parsed.data;

  try {
    await connectToDatabase();
    const admin = await Admin.findOne({ username }).select("+passwordHash");

    // Same message and roughly the same work for both failure modes, so the
    // response cannot be used to confirm which usernames exist.
    const passwordMatches = admin
      ? await bcryptCompare(password, admin.passwordHash)
      : false;

    if (!admin || !passwordMatches) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    await Admin.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });

    await setSessionCookie({
      adminId: admin._id.toString(),
      username: admin.username,
      name: admin.name,
      role: admin.role,
    });

    return NextResponse.json({
      ok: true,
      redirectTo: safeRedirect(request.nextUrl.searchParams.get("from")),
      windowMs: LOCKOUT_WINDOW_MS,
    });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "Could not sign you in right now. Please try again." },
      { status: 500 },
    );
  }
}

// Imported lazily to keep bcrypt off the module graph of the public site.
async function bcryptCompare(plain: string, hash: string) {
  const { compare } = await import("bcryptjs");
  return compare(plain, hash);
}

/**
 * Only ever send the owner to a page inside the panel. Anything else, including
 * protocol-relative URLs like "//evil.test", falls back to the dashboard.
 */
function safeRedirect(from: string | null) {
  if (!from || !from.startsWith("/admin") || from.startsWith("//")) return "/admin";
  if (from.startsWith("/admin/login")) return "/admin";
  return from;
}
