import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export { hashPassword, verifyPassword } from "./password";

const SESSION_COOKIE = "ohayo_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 วัน

function resolveAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  // ใน production ห้ามใช้ค่า default เด็ดขาด — ใครรู้ค่านี้ปลอม cookie เป็นแอดมินได้
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET ยังไม่ได้ตั้งค่า (หรือสั้นกว่า 16 ตัวอักษร) — ตั้ง env AUTH_SECRET ก่อน deploy production",
    );
  }
  return "ohayo-dev-secret-change-me-in-production";
}

const AUTH_SECRET = resolveAuthSecret();

// ===== Session token (HMAC-signed cookie) =====

function sign(value: string): string {
  const sig = createHmac("sha256", AUTH_SECRET).update(value).digest("hex");
  return `${value}.${sig}`;
}

function unsign(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;

  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", AUTH_SECRET).update(value).digest("hex");

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  return timingSafeEqual(sigBuf, expBuf) ? value : null;
}

export function createSession(userId: string): void {
  cookies().set(SESSION_COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function destroySession(): void {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionUserId(): string | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return unsign(token);
}
