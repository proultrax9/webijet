import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { sendDiscord } from "@/lib/discord";
import { TOPUP_METHOD, TOPUP_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const { code } = (await req.json()) as { code?: string };
    const normalized = code?.trim().toUpperCase();
    if (!normalized) {
      return NextResponse.json({ ok: false, message: "กรุณากรอกโค้ด" });
    }

    const redeem = await prisma.redeemCode.findUnique({ where: { code: normalized } });
    if (!redeem || !redeem.isActive) {
      return NextResponse.json({ ok: false, message: "โค้ดไม่ถูกต้องหรือปิดใช้งาน" });
    }
    if (redeem.expiresAt && redeem.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, message: "โค้ดหมดอายุแล้ว" });
    }
    if (redeem.usedCount >= redeem.maxUses) {
      return NextResponse.json({ ok: false, message: "โค้ดถูกใช้ครบจำนวนแล้ว" });
    }

    const txResult = await prisma.$transaction(async (tx) => {
      // เคลมสิทธิ์การใช้โค้ดแบบอะตอมมิก: จะสำเร็จก็ต่อเมื่อ usedCount ยังน้อยกว่า maxUses
      // ป้องกัน race (กดซ้ำ/ยิงขนาน) ไม่ให้โค้ดถูกแลกเกินโควตา
      const claim = await tx.redeemCode.updateMany({
        where: { id: redeem.id, isActive: true, usedCount: { lt: redeem.maxUses } },
        data: { usedCount: { increment: 1 } },
      });
      if (claim.count === 0) return null;

      await tx.topup.create({
        data: {
          userId: user.id,
          amount: redeem.amount,
          method: TOPUP_METHOD.CODE,
          reference: normalized,
          status: TOPUP_STATUS.SUCCESS,
        },
      });
      const u = await tx.user.update({
        where: { id: user.id },
        data: { balance: { increment: redeem.amount } },
      });
      return u;
    });

    if (!txResult) {
      return NextResponse.json({ ok: false, message: "โค้ดถูกใช้ครบจำนวนแล้ว" });
    }
    const updatedUser = txResult;

    const settings = await getSettings();
    await sendDiscord(settings.discord.webhooks.topup, {
      event: "topup",
      title: "🎫 แลกโค้ดเติมเงิน",
      fields: [
        { name: "ผู้ใช้", value: user.username },
        { name: "โค้ด", value: normalized },
        { name: "จำนวน", value: `${redeem.amount} บาท` },
      ],
    });

    return NextResponse.json({
      ok: true,
      message: `แลกโค้ดสำเร็จ +${redeem.amount} บาท`,
      newBalance: updatedUser.balance,
    });
  } catch (err) {
    console.error("[topup:redeem-code]", err);
    return NextResponse.json(
      { ok: false, message: "ไม่สามารถแลกโค้ดได้" },
      { status: 500 },
    );
  }
}
