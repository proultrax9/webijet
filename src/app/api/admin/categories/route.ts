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

// สร้าง slug จากชื่อ ถ้าไม่ได้ระบุ (lowercase, ช่องว่าง -> -)
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

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = (body.name ?? "").toString().trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกชื่อหมวดหมู่" }, { status: 400 });
    }
    const slug = (body.slug ?? "").toString().trim() || slugify(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        imageUrl: body.imageUrl?.toString().trim() || null,
        parentId: body.parentId?.toString().trim() || null,
        priority: toInt(body.priority, 0),
        featured: toBool(body.featured, false),
        isActive: toBool(body.isActive, true),
      },
    });
    return NextResponse.json({ ok: true, category });
  } catch (err) {
    console.error("[categories:POST]", err);
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถเพิ่มหมวดหมู่ได้ (slug อาจซ้ำ)" },
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
      return NextResponse.json({ ok: false, error: "ไม่พบรหัสหมวดหมู่" }, { status: 400 });
    }
    const name = (body.name ?? "").toString().trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "กรุณากรอกชื่อหมวดหมู่" }, { status: 400 });
    }
    const slug = (body.slug ?? "").toString().trim() || slugify(name);

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        imageUrl: body.imageUrl?.toString().trim() || null,
        parentId: body.parentId?.toString().trim() || null,
        priority: toInt(body.priority, 0),
        featured: toBool(body.featured, false),
        isActive: toBool(body.isActive, true),
      },
    });
    return NextResponse.json({ ok: true, category });
  } catch (err) {
    console.error("[categories:PUT]", err);
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถแก้ไขหมวดหมู่ได้" },
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
      return NextResponse.json({ ok: false, error: "ไม่พบรหัสหมวดหมู่" }, { status: 400 });
    }
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { ok: false, error: `ไม่สามารถลบได้ มีสินค้า ${count} รายการในหมวดนี้` },
        { status: 400 },
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[categories:DELETE]", err);
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถลบหมวดหมู่ได้" },
      { status: 400 },
    );
  }
}
