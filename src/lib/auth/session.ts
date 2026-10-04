import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "nguf_session";
const SESSION_DAYS = 7;

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET is missing. Locally: add it to .env.local (see .env.example). " +
      "On Vercel: Project -> Settings -> Environment Variables, add SESSION_SECRET for all " +
      "environments, then redeploy. Generate a value with: " +
      'node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
  );
}

const secretKey = new TextEncoder().encode(SESSION_SECRET);

export type SessionPayload = {
  adminId: string;
  username: string;
  name: string;
  role: "owner";
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey);
}

/** Returns null on any malformed, tampered or expired token. */
export async function readSessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  (await cookies()).set(COOKIE_NAME, token, cookieOptions);
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getSession() {
  return readSessionToken((await cookies()).get(COOKIE_NAME)?.value);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
