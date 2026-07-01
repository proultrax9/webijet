import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { generateBillNumber } from "@/lib/utils";
import { sendDiscord } from "@/lib/discord";
import { ORDER_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** ชิ้นสต็อกถูกซื้อตัดหน้าไประหว่างทำรายการ — ใช้ throw เพื่อ rollback (คืนยอดเงิน) */
class StockRaceError extends Error {}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "กรุณาเข้าสู่ระบบก่อนซื้อสินค้า" }, { status: 401 });
    }

    const { productId } = (await req.json()) as { productId?: string };
    if (!productId) {
      return NextResponse.json({ ok: false, error: "ไม่พบสินค้า" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return NextResponse.json({ ok: false, error: "สินค้าไม่พร้อมจำหน่าย" }, { status: 404 });
    }
    if (product.stock <= 0) {
      return NextResponse.json({ ok: false, error: "สินค้าหมดแล้ว" }, { status: 400 });
    }

    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser || freshUser.balance < product.price) {
      return NextResponse.json(
        { ok: false, error: "ยอดเงินไม่เพียงพอ กรุณาเติมเงินก่อน" },
        { status: 400 },
      );
    }

    const stockItem = await prisma.stockItem.findFirst({
      where: { productId: product.id, isSold: false },
    });

    const billNumber = generateBillNumber();
    const delivered = stockItem?.content ?? `DEMO-${product.slug}-${Date.now()}`;

    const outcome = await prisma.$transaction(async (tx) => {
      // หักยอดเงินแบบอะตอมมิก: สำเร็จเฉพาะเมื่อยอดยังพอ (กัน race/ยอดติดลบ และไม่ทับยอดเติมเงินที่เข้ามาระหว่างทาง)
      const debit = await tx.user.updateMany({
        where: { id: user.id, balance: { gte: product.price } },
        data: { balance: { decrement: product.price } },
      });
      if (debit.count === 0) return { kind: "insufficient" as const };

      if (stockItem) {
        // เคลมชิ้นสต็อกแบบอะตอมมิก: สำเร็จเฉพาะเมื่อยังไม่ถูกขาย กันส่งของชิ้นเดียวซ้ำให้สองคน
        const claim = await tx.stockItem.updateMany({
          where: { id: stockItem.id, isSold: false },
          data: { isSold: true, soldAt: new Date() },
        });
        if (claim.count === 0) throw new StockRaceError();
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: 1 } },
        });
      }

      const o = await tx.order.create({
        data: {
          billNumber,
          userId: user.id,
          totalPrice: product.price,
          status: ORDER_STATUS.COMPLETED,
          items: {
            create: {
              productId: product.id,
              price: product.price,
              delivered,
            },
          },
        },
      });

      const u = await tx.user.findUnique({ where: { id: user.id } });
      return { kind: "ok" as const, order: o, balance: u?.balance ?? 0 };
    });

    if (outcome.kind === "insufficient") {
      return NextResponse.json(
        { ok: false, error: "ยอดเงินไม่เพียงพอ กรุณาเติมเงินก่อน" },
        { status: 400 },
      );
    }
    const order = outcome.order;

    const settings = await getSettings();
    await sendDiscord(settings.discord.webhooks.purchase, {
      event: "purchase",
      title: "🛍 มีการซื้อสินค้า",
      fields: [
        { name: "ผู้ใช้", value: user.username },
        { name: "สินค้า", value: product.name },
        { name: "ราคา", value: `${product.price} บาท` },
        { name: "บิล", value: order.billNumber },
      ],
    });

    return NextResponse.json({
      ok: true,
      billNumber: order.billNumber,
      delivered,
      newBalance: outcome.balance,
    });
  } catch (err) {
    if (err instanceof StockRaceError) {
      return NextResponse.json(
        { ok: false, error: "สินค้าเพิ่งถูกซื้อไป กรุณาลองใหม่อีกครั้ง" },
        { status: 409 },
      );
    }
    console.error("[orders:POST]", err);
    return NextResponse.json({ ok: false, error: "ไม่สามารถสร้างออเดอร์ได้" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({ ok: true, orders });
}
