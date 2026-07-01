import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function pickPrize<T extends { probability: number }>(prizes: T[]): T | null {
  if (prizes.length === 0) return null;
  const total = prizes.reduce((s, p) => s + p.probability, 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= p.probability;
    if (r <= 0) return p;
  }
  return prizes[prizes.length - 1];
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const minigame = await prisma.minigame.findUnique({
      where: { id: params.id },
      include: { prizes: true },
    });
    if (!minigame || !minigame.isActive) {
      return NextResponse.json({ ok: false, error: "มินิเกมไม่พร้อมเล่น" }, { status: 404 });
    }

    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser) {
      return NextResponse.json({ ok: false, error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    if (minigame.usePoints) {
      if (freshUser.points < minigame.priceBaht) {
        return NextResponse.json({ ok: false, error: "แต้มไม่เพียงพอ" }, { status: 400 });
      }
    } else if (freshUser.balance < minigame.priceBaht) {
      return NextResponse.json({ ok: false, error: "ยอดเงินไม่เพียงพอ" }, { status: 400 });
    }

    const prize = pickPrize(minigame.prizes);
    const won = !!prize && prize.rewardType !== "none";

    const played = await prisma.$transaction(async (tx) => {
      // หักค่าเล่นแบบอะตอมมิก: สำเร็จเฉพาะเมื่อยอดยังพอ (กันกดรัวจนติดลบ)
      const debit = minigame.usePoints
        ? await tx.user.updateMany({
            where: { id: user.id, points: { gte: minigame.priceBaht } },
            data: { points: { decrement: minigame.priceBaht } },
          })
        : await tx.user.updateMany({
            where: { id: user.id, balance: { gte: minigame.priceBaht } },
            data: { balance: { decrement: minigame.priceBaht } },
          });
      if (debit.count === 0) return false;

      if (won && prize) {
        if (prize.rewardType === "balance") {
          await tx.user.update({
            where: { id: user.id },
            data: { balance: { increment: Number(prize.rewardValue) || 0 } },
          });
        } else if (prize.rewardType === "points") {
          await tx.user.update({
            where: { id: user.id },
            data: { points: { increment: Number(prize.rewardValue) || 0 } },
          });
        }
      }

      await tx.minigamePlay.create({
        data: {
          minigameId: minigame.id,
          userId: user.id,
          won,
          prizeName: prize?.name ?? null,
        },
      });
      return true;
    });

    if (!played) {
      return NextResponse.json(
        { ok: false, error: minigame.usePoints ? "แต้มไม่เพียงพอ" : "ยอดเงินไม่เพียงพอ" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      won,
      prizeName: prize?.name ?? null,
      reward: won
        ? `คุณได้รับ ${prize?.name ?? "รางวัล"}!`
        : "เสียใจด้วย ครั้งหน้าขอให้โชคดี!",
    });
  } catch (err) {
    console.error("[minigame:play]", err);
    return NextResponse.json({ ok: false, error: "เล่นไม่สำเร็จ" }, { status: 500 });
  }
}
