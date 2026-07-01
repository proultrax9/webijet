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

    const body = (await req.json()) as { productId?: string; quantity?: number };
    const productId = body.productId;
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

    // จำนวนที่ซื้อ: บังคับตามขั้นต่ำ/สูงสุดของสินค้า
    const qty = Math.max(1, Math.trunc(Number(body.quantity) || 1));
    if (qty < product.minQty) {
      return NextResponse.json(
        { ok: false, error: `สินค้านี้ต้องซื้อขั้นต่ำ ${product.minQty} ชิ้น` },
        { status: 400 },
      );
    }
    if (qty > product.maxQty) {
      return NextResponse.json(
        { ok: false, error: `สินค้านี้ซื้อได้สูงสุด ${product.maxQty} ชิ้นต่อครั้ง` },
        { status: 400 },
      );
    }
    if (qty > product.stock) {
      return NextResponse.json(
        { ok: false, error: `สต็อกไม่เพียงพอ (คงเหลือ ${product.stock} ชิ้น)` },
        { status: 400 },
      );
    }

    const totalPrice = product.price * qty;

    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser || freshUser.balance < totalPrice) {
      return NextResponse.json(
        { ok: false, error: "ยอดเงินไม่เพียงพอ กรุณาเติมเงินก่อน" },
        { status: 400 },
      );
    }

    // โปรซื้อ X แถม Y (แถมได้เท่าที่สต็อกจริงเหลือ)
    const promoFree =
      product.promoBuyQty > 0 && product.promoFreeQty > 0
        ? Math.floor(qty / product.promoBuyQty) * product.promoFreeQty
        : 0;

    const stockItems = await prisma.stockItem.findMany({
      where: { productId: product.id, isSold: false },
      take: qty + promoFree,
    });

    // มีสต็อกจริงในระบบแต่ไม่พอตามจำนวนที่ซื้อ
    if (stockItems.length > 0 && stockItems.length < qty) {
      return NextResponse.json(
        { ok: false, error: `สต็อกไม่เพียงพอ (คงเหลือ ${stockItems.length} ชิ้น)` },
        { status: 400 },
      );
    }

    const billNumber = generateBillNumber();
    const deliveredList =
      stockItems.length > 0
        ? stockItems.map((s) => s.content)
        : Array.from({ length: qty }, (_, i) => `DEMO-${product.slug}-${Date.now()}-${i + 1}`);
    const paidCount = stockItems.length > 0 ? Math.min(qty, stockItems.length) : qty;

    const outcome = await prisma.$transaction(async (tx) => {
      // หักยอดเงินแบบอะตอมมิก: สำเร็จเฉพาะเมื่อยอดยังพอ (กัน race/ยอดติดลบ และไม่ทับยอดเติมเงินที่เข้ามาระหว่างทาง)
      const debit = await tx.user.updateMany({
        where: { id: user.id, balance: { gte: totalPrice } },
        data: { balance: { decrement: totalPrice } },
      });
      if (debit.count === 0) return { kind: "insufficient" as const };

      if (stockItems.length > 0) {
        // เคลมชิ้นสต็อกแบบอะตอมมิก: สำเร็จเฉพาะเมื่อยังไม่ถูกขายครบทุกชิ้น กันส่งของชิ้นเดียวซ้ำให้สองคน
        const claim = await tx.stockItem.updateMany({
          where: { id: { in: stockItems.map((s) => s.id) }, isSold: false },
          data: { isSold: true, soldAt: new Date() },
        });
        if (claim.count !== stockItems.length) throw new StockRaceError();
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: stockItems.length } },
        });
      }

      const o = await tx.order.create({
        data: {
          billNumber,
          userId: user.id,
          totalPrice,
          status: ORDER_STATUS.COMPLETED,
          items: {
            create: deliveredList.map((delivered, i) => ({
              productId: product.id,
              productName: product.name, // snapshot กันชื่อหายถ้าสินค้าถูกลบ
              // ชิ้นที่เกินจำนวนที่จ่าย = ของแถม ราคา 0
              price: i < paidCount ? product.price : 0,
              delivered,
            })),
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
        { name: "สินค้า", value: `${product.name} x${qty}` },
        { name: "ราคา", value: `${totalPrice} บาท` },
        { name: "บิล", value: order.billNumber },
      ],
    });

    return NextResponse.json({
      ok: true,
      billNumber: order.billNumber,
      delivered: deliveredList.join("\n"),
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
