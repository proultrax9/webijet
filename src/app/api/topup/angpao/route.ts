import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { redeemAngpao } from "@/lib/truemoney-angpao";
import { sendDiscord } from "@/lib/discord";
import { TOPUP_METHOD, TOPUP_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "กรุณาเข้าสู่ระบบก่อนเติมเงิน" },
        { status: 401 },
      );
    }

    const settings = await getSettings();
    if (!settings.payment.enableAngpao) {
      return NextResponse.json({ ok: false, message: "ระบบอั่งเปาปิดใช้งานชั่วคราว" });
    }

    const { voucherUrl } = (await req.json()) as { voucherUrl?: string };
    if (!voucherUrl?.trim()) {
      return NextResponse.json({ ok: false, message: "กรุณากรอกลิงก์อั่งเปา" });
    }

    const merchantPhone = process.env.TRUEMONEY_PHONE ?? "";
    const result = await redeemAngpao(merchantPhone, voucherUrl.trim());

    if (!result.ok) {
      await prisma.topup.create({
        data: {
          userId: user.id,
          amount: 0,
          method: TOPUP_METHOD.ANGPAO,
          reference: voucherUrl.slice(0, 64),
          status: TOPUP_STATUS.FAILED,
        },
      });
      return NextResponse.json({ ok: false, message: result.message });
    }

    const duplicate = await prisma.topup.findFirst({
      where: { reference: result.reference, status: TOPUP_STATUS.SUCCESS },
    });
    if (duplicate) {
      return NextResponse.json({ ok: false, message: "อั่งเปานี้ถูกใช้ไปแล้ว" });
    }

    let txResult;
    try {
      txResult = await prisma.$transaction(async (tx) => {
        // กันวอยเชอร์เดิมถูกเคลมซ้ำแบบขนาน (insert PK ซ้ำจะ throw → rollback)
        await tx.usedVoucher.create({ data: { reference: result.reference } });

        const t = await tx.topup.create({
          data: {
            userId: user.id,
            amount: result.amount,
            method: TOPUP_METHOD.ANGPAO,
            reference: result.reference,
            status: TOPUP_STATUS.SUCCESS,
          },
        });

        let pointsAdd = 0;
        if (settings.points.fromTopup) {
          pointsAdd = Math.floor(result.amount / 10);
        }

        const u = await tx.user.update({
          where: { id: user.id },
          data: {
            balance: { increment: result.amount },
            points: pointsAdd ? { increment: pointsAdd } : undefined,
          },
        });

        return [t, u] as const;
      });
    } catch (e) {
      // Prisma P2002 = unique constraint (วอยเชอร์ถูกใช้ไปแล้ว)
      if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
        return NextResponse.json({ ok: false, message: "อั่งเปานี้ถูกใช้ไปแล้ว" });
      }
      throw e;
    }
    const [topup, updatedUser] = txResult;

    await sendDiscord(settings.discord.webhooks.topup, {
      event: "topup",
      title: "💰 เติมเงินสำเร็จ (อั่งเปา)",
      fields: [
        { name: "ผู้ใช้", value: user.username },
        { name: "จำนวน", value: `${result.amount} บาท` },
        { name: "ยอดคงเหลือ", value: `${updatedUser.balance} บาท` },
      ],
    });

    return NextResponse.json({
      ok: true,
      message: result.message,
      amount: result.amount,
      newBalance: updatedUser.balance,
      topupId: topup.id,
    });
  } catch (err) {
    console.error("[topup:angpao]", err);
    return NextResponse.json(
      { ok: false, message: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
      { status: 500 },
    );
  }
}
