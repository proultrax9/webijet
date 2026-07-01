import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// แยกจาก auth.ts เพื่อให้ seed script (รันด้วย tsx นอก Next runtime) import ได้
// โดยไม่ต้องดึง next/headers เข้ามา

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;

  // รองรับ user ที่ seed ไว้ด้วยรหัส plaintext (dev เท่านั้น)
  if (!stored.startsWith("scrypt$")) {
    return stored === password;
  }

  const [, salt, key] = stored.split("$");
  if (!salt || !key) return false;

  const derived = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== derived.length) return false;
  return timingSafeEqual(keyBuffer, derived);
}
