import { NextResponse, type NextRequest } from "next/server";
import { readSessionOrNull } from "@/lib/auth/verify-session";

/** Standard JSON error body so every admin fetch call handles failure the same way. */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Every admin API route calls this first. Returns a 401 response instead of
 * throwing so handlers stay flat.
 */
export async function requireAdmin() {
  const session = await readSessionOrNull();
  if (!session) {
    return { session: null, response: apiError("Your session has expired. Sign in again.", 401) } as const;
  }
  return { session, response: null } as const;
}

/** Parses a JSON body without letting a malformed payload throw a 500. */
export async function readJsonBody(request: NextRequest) {
  try {
    return { data: await request.json(), error: null } as const;
  } catch {
    return { data: null, error: apiError("Invalid request body", 400) } as const;
  }
}

export function isValidObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}
