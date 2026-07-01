import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { isBanned } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { sendDiscord } from "@/lib/discord";

export const dynamic = "force-dynamic";

const PERMANENT_BAN_YEAR = 9000;

function banMessage(bannedUntil: Date): string {
  if (bannedUntil.getUTCFullYear() >= PERMANENT_BAN_YEAR) {
    return "บัญชีนี้ถูกระงับถาวร";
  }
  const d = bannedUntil.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `บัญชีนี้ถูกระงับถึง ${d}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "กรุณากรอกอีเมลและรหัสผ่าน" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    if (isBanned(user.bannedUntil)) {
      return NextResponse.json(
        { ok: false, error: banMessage(user.bannedUntil!) },
        { status: 403 },
      );
    }

    createSession(user.id);

    const settings = await getSettings();
    await sendDiscord(settings.discord.webhooks.login, {
      event: "login",
      title: "🔑 เข้าสู่ระบบ",
      fields: [
        { name: "ผู้ใช้", value: user.username },
        { name: "อีเมล", value: user.email },
      ],
    });

    return NextResponse.json({ ok: true, role: user.role });
  } catch (err) {
    console.error("[auth:login]", err);
    return NextResponse.json({ ok: false, error: "เข้าสู่ระบบไม่สำเร็จ" }, { status: 500 });
  }
}
