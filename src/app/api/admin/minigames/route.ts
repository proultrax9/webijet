import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function toBool(v: unknown, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "on" || v === "1";
  return fallback;
}

function toFloat(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "ต้องเป็นผู้ดูแลระบบ" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const name = (body.name ?? "").toString().trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกชื่อมินิเกม" }, { status: 400 });
    }

    const minigame = await prisma.minigame.create({
      data: {
        name,
        description: body.description?.toString().trim() || null,
        imageUrl: body.imageUrl?.toString().trim() || null,
        priceBaht: toFloat(body.priceBaht, 0),
        usePoints: toBool(body.usePoints, false),
        sortOrder: toInt(body.sortOrder, 0),
        isActive: toBool(body.isActive, true),
      },
    });

    // รางวัลเริ่มต้น 3 รายการ
    await prisma.minigamePrize.createMany({
      data: [
        { minigameId: minigame.id, name: "ไม่ได้รางวัล", probability: 0.5, rewardType: "none", rewardValue: "0" },
        { minigameId: minigame.id, name: "10 บาท", probability: 0.35, rewardType: "balance", rewardValue: "10" },
        { minigameId: minigame.id, name: "50 บาท", probability: 0.15, rewardType: "balance", rewardValue: "50" },
      ],
    });

    return NextResponse.json({ ok: true, minigame });
  } catch (err) {
    console.error("[minigames:POST]", err);
    return NextResponse.json({ ok: false, error: "ไม่สามารถสร้างมินิเกมได้" }, { status: 400 });
  }
}
