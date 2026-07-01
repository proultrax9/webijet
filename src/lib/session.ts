import { prisma } from "./prisma";
import { getSessionUserId } from "./auth";

// Session จริง: อ่าน userId จาก cookie ที่เซ็นด้วย HMAC (src/lib/auth.ts)

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  balance: number;
  points: number;
  avatarUrl: string | null;
};

function toSessionUser(user: {
  id: string;
  email: string;
  username: string;
  role: string;
  balance: number;
  points: number;
  avatarUrl: string | null;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    balance: user.balance,
    points: user.points,
    avatarUrl: user.avatarUrl,
  };
}

/** true ถ้าบัญชีนี้ถูกแบนอยู่ (ยังไม่หมดเวลา) */
export function isBanned(bannedUntil: Date | null): boolean {
  return !!bannedUntil && bannedUntil.getTime() > Date.now();
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  // ผู้ใช้ที่ถูกแบนอยู่: ตัดสิทธิ์ทุกหน้า/ทุก API ที่ต้องล็อกอิน
  if (isBanned(user.bannedUntil)) return null;
  return toSessionUser(user);
}

export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
