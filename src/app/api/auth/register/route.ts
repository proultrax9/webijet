import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { sendDiscord } from "@/lib/discord";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      username?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "อีเมลไม่ถูกต้อง" }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json(
        { ok: false, error: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร" },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      const dup = existing.email === email ? "อีเมลนี้" : "ชื่อผู้ใช้นี้";
      return NextResponse.json({ ok: false, error: `${dup}ถูกใช้งานแล้ว` }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashPassword(password),
        role: "USER",
      },
    });

    createSession(user.id);

    const settings = await getSettings();
    await sendDiscord(settings.discord.webhooks.register, {
      event: "register",
      title: "🎉 มีสมาชิกใหม่",
      fields: [
        { name: "ผู้ใช้", value: username },
        { name: "อีเมล", value: email },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth:register]", err);
    return NextResponse.json({ ok: false, error: "สมัครสมาชิกไม่สำเร็จ" }, { status: 500 });
  }
}
