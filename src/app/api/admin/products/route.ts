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

function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

function toFloatOrNull(v: unknown) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(v: unknown) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toStrOrNull(v: unknown) {
  const s = v?.toString().trim();
  return s ? s : null;
}

// ฟิลด์ร่วมของ POST/PUT ที่มาจากฟอร์มสินค้า
function productDataFromBody(body: Record<string, unknown>) {
  const minQty = Math.max(1, toInt(body.minQty, 1));
  const maxQty = Math.max(minQty, toInt(body.maxQty, 1000));
  return {
    description: toStrOrNull(body.description),
    imageUrl: toStrOrNull(body.imageUrl),
    downloadUrl: toStrOrNull(body.downloadUrl),
    videoUrl: toStrOrNull(body.videoUrl),
    duration: toStrOrNull(body.duration),
    price: toFloat(body.price, 0),
    priceMin: toFloatOrNull(body.priceMin),
    priceMax: toFloatOrNull(body.priceMax),
    stock: toInt(body.stock, 0),
    priority: toInt(body.priority, 0),
    minQty,
    maxQty,
    featured: toBool(body.featured, false),
    bestseller: toBool(body.bestseller, false),
    special: toBool(body.special, false),
    warranty: toBool(body.warranty, false),
    isPreorder: toBool(body.isPreorder, false),
    requiresInput: toBool(body.requiresInput, false),
    isActive: toBool(body.isActive, true),
    allowPoints: toBool(body.allowPoints, false),
    promoBuyQty: Math.max(0, toInt(body.promoBuyQty, 0)),
    promoFreeQty: Math.max(0, toInt(body.promoFreeQty, 0)),
    installment: toBool(body.installment, false),
    colorPrimary: toStrOrNull(body.colorPrimary),
    colorSecondary: toStrOrNull(body.colorSecondary),
    badgeLabel: toStrOrNull(body.badgeLabel),
    badgeColor: toStrOrNull(body.badgeColor),
    resellerPrice: toFloatOrNull(body.resellerPrice),
    discountPct: toIntOrNull(body.discountPct),
  };
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = (body.name ?? "").toString().trim();
    const categoryId = (body.categoryId ?? "").toString().trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกชื่อสินค้า" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ ok: false, error: "กรุณาเลือกหมวดหมู่" }, { status: 400 });
    }
    const slug = (body.slug ?? "").toString().trim() || slugify(name);

    // เลขสินค้าถัดไปสำหรับ URL /products/{no}
    const maxNo = await prisma.product.aggregate({ _max: { no: true } });
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        no: (maxNo._max.no ?? 0) + 1,
        categoryId,
        ...productDataFromBody(body),
      },
    });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error("[products:POST]", err);
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถเพิ่มสินค้าได้ (slug อาจซ้ำ)" },
      { status: 400 },
    );
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = (body.id ?? "").toString();
    if (!id) {
      return NextResponse.json({ ok: false, error: "ไม่พบรหัสสินค้า" }, { status: 400 });
    }
    const name = (body.name ?? "").toString().trim();
    const categoryId = (body.categoryId ?? "").toString().trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกชื่อสินค้า" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ ok: false, error: "กรุณาเลือกหมวดหมู่" }, { status: 400 });
    }
    const slug = (body.slug ?? "").toString().trim() || slugify(name);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        categoryId,
        ...productDataFromBody(body),
      },
    });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    console.error("[products:PUT]", err);
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถแก้ไขสินค้าได้" },
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
      return NextResponse.json({ ok: false, error: "ไม่พบรหัสสินค้า" }, { status: 400 });
    }
    // เก็บชื่อสินค้าลงประวัติออเดอร์ก่อนลบ (กันชื่อหายในหน้าประวัติ)
    const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
    if (product) {
      await prisma.orderItem.updateMany({
        where: { productId: id, productName: null },
        data: { productName: product.name },
      });
    }
    // stock/รีวิวถูกลบตาม (cascade) ส่วนประวัติออเดอร์คงอยู่โดยอ้างชื่อจาก snapshot
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[products:DELETE]", err);
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถลบสินค้าได้ (อาจมีออเดอร์อ้างอิงอยู่)" },
      { status: 400 },
    );
  }
}
