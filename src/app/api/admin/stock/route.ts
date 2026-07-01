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

/** ปรับตัวเลข stock ของสินค้าให้ตรงกับจำนวนชิ้นที่ยังไม่ขายจริง */
async function syncStockCount(productId: string) {
  const available = await prisma.stockItem.count({
    where: { productId, isSold: false },
  });
  await prisma.product.update({ where: { id: productId }, data: { stock: available } });
  return available;
}

// GET /api/admin/stock?productId=... — รายการสต็อกทั้งหมดของสินค้า + ผู้ซื้อ
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ ok: false, error: "ไม่พบสินค้า" }, { status: 400 });
  }

  const items = await prisma.stockItem.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });

  // หาผู้ซื้อจาก order items ที่ delivered ตรงกับ content ของชิ้นที่ขายแล้ว
  const soldContents = items.filter((i) => i.isSold).map((i) => i.content);
  const buyers = new Map<string, string>();
  if (soldContents.length > 0) {
    const orderItems = await prisma.orderItem.findMany({
      where: { productId, delivered: { in: soldContents } },
      include: { order: { include: { user: { select: { username: true } } } } },
    });
    for (const oi of orderItems) {
      if (oi.delivered) buyers.set(oi.delivered, oi.order.user.username);
    }
  }

  return NextResponse.json({
    ok: true,
    items: items.map((i) => ({
      id: i.id,
      content: i.content,
      isSold: i.isSold,
      soldAt: i.soldAt,
      createdAt: i.createdAt,
      buyer: i.isSold ? (buyers.get(i.content) ?? null) : null,
    })),
  });
}

// POST /api/admin/stock — action: add | edit | markSold | markAvailable | delete | clear | sync
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const action = (body.action ?? "").toString();
    const productId = (body.productId ?? "").toString();
    if (!productId) {
      return NextResponse.json({ ok: false, error: "ไม่พบสินค้า" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ ok: false, error: "ไม่พบสินค้า" }, { status: 404 });
    }

    switch (action) {
      case "add": {
        // รับได้ทั้งบรรทัดเดียวและหลายบรรทัด (bulk)
        const lines = (body.contents ?? "")
          .toString()
          .split("\n")
          .map((l: string) => l.trim())
          .filter(Boolean);
        if (lines.length === 0) {
          return NextResponse.json({ ok: false, error: "กรุณากรอกข้อมูลสต็อก" }, { status: 400 });
        }
        await prisma.stockItem.createMany({
          data: lines.map((content: string) => ({ productId, content })),
        });
        const stock = await syncStockCount(productId);
        return NextResponse.json({ ok: true, added: lines.length, stock });
      }

      case "edit": {
        const id = (body.id ?? "").toString();
        const content = (body.content ?? "").toString().trim();
        if (!id || !content) {
          return NextResponse.json({ ok: false, error: "ข้อมูลไม่ครบ" }, { status: 400 });
        }
        await prisma.stockItem.update({ where: { id }, data: { content } });
        return NextResponse.json({ ok: true });
      }

      case "markSold": {
        const id = (body.id ?? "").toString();
        if (!id) return NextResponse.json({ ok: false, error: "ข้อมูลไม่ครบ" }, { status: 400 });
        await prisma.stockItem.update({
          where: { id },
          data: { isSold: true, soldAt: new Date() },
        });
        const stock = await syncStockCount(productId);
        return NextResponse.json({ ok: true, stock });
      }

      case "markAvailable": {
        const id = (body.id ?? "").toString();
        if (!id) return NextResponse.json({ ok: false, error: "ข้อมูลไม่ครบ" }, { status: 400 });
        await prisma.stockItem.update({
          where: { id },
          data: { isSold: false, soldAt: null },
        });
        const stock = await syncStockCount(productId);
        return NextResponse.json({ ok: true, stock });
      }

      case "delete": {
        const id = (body.id ?? "").toString();
        if (!id) return NextResponse.json({ ok: false, error: "ข้อมูลไม่ครบ" }, { status: 400 });
        await prisma.stockItem.delete({ where: { id } });
        const stock = await syncStockCount(productId);
        return NextResponse.json({ ok: true, stock });
      }

      case "clear": {
        // ล้างเฉพาะชิ้นที่ยังไม่ขาย เพื่อไม่ทำลายประวัติการซื้อ
        const result = await prisma.stockItem.deleteMany({
          where: { productId, isSold: false },
        });
        const stock = await syncStockCount(productId);
        return NextResponse.json({ ok: true, deleted: result.count, stock });
      }

      case "sync": {
        const stock = await syncStockCount(productId);
        return NextResponse.json({ ok: true, stock });
      }

      default:
        return NextResponse.json({ ok: false, error: "ไม่รู้จักคำสั่งนี้" }, { status: 400 });
    }
  } catch (err) {
    console.error("[admin/stock:POST]", err);
    return NextResponse.json({ ok: false, error: "ดำเนินการไม่สำเร็จ" }, { status: 500 });
  }
}
