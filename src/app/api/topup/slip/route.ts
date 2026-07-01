import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { verifySlipImage, receiverMatchesShop } from "@/lib/rdcw-slip";
import { sendDiscord } from "@/lib/discord";
import { TOPUP_METHOD, TOPUP_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const MAX_TOPUP = 100_000; // เพดานต่อรายการ
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const settings = await getSettings();
    if (!settings.payment.enableSlipUpload) {
      return NextResponse.json({ ok: false, message: "ระบบอัปโหลดสลิปปิดใช้งาน" });
    }

    const { imageBase64, contentType } = (await req.json()) as {
      imageBase64?: string;
      contentType?: string;
    };

    if (!imageBase64) {
      return NextResponse.json({ ok: false, message: "กรุณาแนบรูปสลิป" });
    }
    // ประเมินขนาดไฟล์จากความยาว base64 (โดยประมาณ)
    if (imageBase64.length * 0.75 > MAX_IMAGE_BYTES) {
      return NextResponse.json({ ok: false, message: "ไฟล์รูปใหญ่เกินไป (สูงสุด 5MB)" });
    }
    const ct = contentType === "image/png" ? "image/png" : "image/jpeg";

    // ===== ตรวจสลิปจริงผ่าน RDCW =====
    const result = await verifySlipImage(imageBase64, ct);

    if (!result.ok) {
      await prisma.topup.create({
        data: {
          userId: user.id,
          amount: 0,
          method: TOPUP_METHOD.BANK_SLIP,
          reference: null,
          status: TOPUP_STATUS.FAILED,
        },
      });
      return NextResponse.json({ ok: false, message: result.message });
    }

    // ตรวจว่าบัญชีผู้รับตรงกับบัญชีร้าน (กันเอาสลิปโอนเข้าบัญชีอื่นมาใช้)
    const matches = receiverMatchesShop(result.receiverAccount, [
      settings.payment.bankAccountNumber,
      settings.payment.promptpayNumber,
    ]);
    if (!matches) {
      await prisma.topup.create({
        data: {
          userId: user.id,
          amount: 0,
          method: TOPUP_METHOD.BANK_SLIP,
          reference: result.transRef,
          status: TOPUP_STATUS.FAILED,
        },
      });
      return NextResponse.json({
        ok: false,
        message: "บัญชีผู้รับในสลิปไม่ตรงกับบัญชีร้าน",
      });
    }

    const creditAmount = Math.min(result.amount, MAX_TOPUP);
    if (!Number.isFinite(creditAmount) || creditAmount <= 0) {
      return NextResponse.json({ ok: false, message: "ยอดเงินจากสลิปไม่ถูกต้อง" });
    }

    // ===== เติมเงินแบบอะตอมมิก + กันสลิปซ้ำด้วย transRef =====
    let updated;
    try {
      updated = await prisma.$transaction(async (tx) => {
        await tx.usedVoucher.create({ data: { reference: `slip:${result.transRef}` } });

        const t = await tx.topup.create({
          data: {
            userId: user.id,
            amount: creditAmount,
            method: TOPUP_METHOD.BANK_SLIP,
            reference: result.transRef,
            status: TOPUP_STATUS.SUCCESS,
          },
        });

        let pointsAdd = 0;
        if (settings.points.fromTopup) pointsAdd = Math.floor(creditAmount / 10);

        const u = await tx.user.update({
          where: { id: user.id },
          data: {
            balance: { increment: creditAmount },
            points: pointsAdd ? { increment: pointsAdd } : undefined,
          },
        });
        return { topup: t, user: u };
      });
    } catch (e) {
      if (typeof e === "object" && e && "code" in e && (e as { code?: string }).code === "P2002") {
        return NextResponse.json({ ok: false, message: "สลิปนี้ถูกใช้ไปแล้ว" });
      }
      throw e;
    }

    await sendDiscord(settings.discord.webhooks.topup, {
      event: "topup",
      title: "🏦 เติมเงินผ่านสลิป (ตรวจอัตโนมัติ RDCW)",
      fields: [
        { name: "ผู้ใช้", value: user.username },
        { name: "จำนวน", value: `${creditAmount} บาท` },
        { name: "อ้างอิง", value: result.transRef },
      ],
    });

    return NextResponse.json({
      ok: true,
      message: `ตรวจสอบสลิปสำเร็จ เติมเงิน +${creditAmount} บาท`,
      newBalance: updated.user.balance,
      topupId: updated.topup.id,
    });
  } catch (err) {
    console.error("[topup:slip]", err);
    return NextResponse.json(
      { ok: false, message: "ไม่สามารถตรวจสอบสลิปได้" },
      { status: 500 },
    );
  }
}
