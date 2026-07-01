import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const admin = await getAdminUser();
  return admin
    ? null
    : NextResponse.json({ ok: false, error: "ต้องเป็นผู้ดูแลระบบ" }, { status: 403 });
}

function toBool(v: unknown, fallback = true) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "on" || v === "1";
  return fallback;
}

function toInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const question = (body.question ?? "").toString().trim();
    const answer = (body.answer ?? "").toString().trim();
    if (!question || !answer) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกคำถามและคำตอบ" }, { status: 400 });
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        sortOrder: toInt(body.sortOrder, 0),
        isActive: toBool(body.isActive, true),
      },
    });
    return NextResponse.json({ ok: true, faq });
  } catch (err) {
    console.error("[faq:POST]", err);
    return NextResponse.json({ ok: false, error: "ไม่สามารถเพิ่ม FAQ ได้" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "ไม่พบรหัส FAQ" }, { status: 400 });
    }
    await prisma.faq.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[faq:DELETE]", err);
    return NextResponse.json({ ok: false, error: "ไม่สามารถลบ FAQ ได้" }, { status: 400 });
  }
}
