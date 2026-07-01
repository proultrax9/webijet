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

function toBool(v: unknown, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "on" || v === "1";
  return fallback;
}

function toInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toFloat(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const code = (body.code ?? "").toString().trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกรหัสโค้ด" }, { status: 400 });
    }
    const amount = toFloat(body.amount, 0);
    if (amount <= 0) {
      return NextResponse.json({ ok: false, error: "จำนวนเงินต้องมากกว่า 0" }, { status: 400 });
    }
    const maxUses = toInt(body.maxUses, 1);
    if (maxUses < 1) {
      return NextResponse.json({ ok: false, error: "จำนวนครั้งที่ใช้ได้ต้องมากกว่า 0" }, { status: 400 });
    }

    let expiresAt: Date | null = null;
    if (body.expiresAt) {
      const d = new Date(body.expiresAt);
      if (!Number.isNaN(d.getTime())) expiresAt = d;
    }

    const created = await prisma.redeemCode.create({
      data: {
        code,
        amount,
        maxUses,
        expiresAt,
        isActive: toBool(body.isActive, true),
      },
    });
    return NextResponse.json({ ok: true, code: created });
  } catch (err) {
    console.error("[codes:POST]", err);
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถสร้างโค้ดได้ (รหัสอาจซ้ำ)" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "ไม่พบรหัสโค้ด" }, { status: 400 });
    }
    await prisma.redeemCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[codes:DELETE]", err);
    return NextResponse.json({ ok: false, error: "ไม่สามารถลบโค้ดได้" }, { status: 400 });
  }
}
