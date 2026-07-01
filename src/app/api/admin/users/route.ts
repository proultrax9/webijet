import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// วันแบนถาวร: ตั้งเป็นปีไกล ๆ
const PERMANENT_BAN = new Date("9999-12-31T23:59:59.000Z");
const BAN_DAYS: Record<string, number> = { "1": 1, "7": 7, "30": 30 };

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "ต้องเป็นผู้ดูแลระบบ" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      userId?: string;
      action?: string;
      duration?: string; // "1" | "7" | "30" | "permanent"
    };
    const { userId, action, duration } = body;

    const VALID = ["promote", "demote", "ban", "unban", "delete"];
    if (!userId || !action || !VALID.includes(action)) {
      return NextResponse.json({ ok: false, error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json(
        { ok: false, error: "ไม่สามารถทำรายการกับบัญชีตัวเองได้" },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ ok: false, error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    // กันทำรายการรุนแรงกับผู้ดูแลระบบคนอื่น (แบน/ลบ/ลดสิทธิ์แอดมินคนสุดท้าย)
    if (action === "demote" || action === "ban" || action === "delete") {
      if (target.role === "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { ok: false, error: "ต้องมีผู้ดูแลระบบอย่างน้อย 1 คน" },
            { status: 400 },
          );
        }
      }
    }

    switch (action) {
      case "promote":
      case "demote": {
        const newRole = action === "promote" ? "ADMIN" : "USER";
        await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
        return NextResponse.json({ ok: true, role: newRole });
      }

      case "ban": {
        let bannedUntil: Date;
        if (duration === "permanent") {
          bannedUntil = PERMANENT_BAN;
        } else if (duration && BAN_DAYS[duration]) {
          bannedUntil = new Date(Date.now() + BAN_DAYS[duration] * 24 * 60 * 60 * 1000);
        } else {
          return NextResponse.json({ ok: false, error: "ระยะเวลาแบนไม่ถูกต้อง" }, { status: 400 });
        }
        await prisma.user.update({ where: { id: userId }, data: { bannedUntil } });
        return NextResponse.json({ ok: true, bannedUntil: bannedUntil.toISOString() });
      }

      case "unban": {
        await prisma.user.update({ where: { id: userId }, data: { bannedUntil: null } });
        return NextResponse.json({ ok: true });
      }

      case "delete": {
        // ลบข้อมูลที่อ้างอิงถึง user ก่อน เพื่อเลี่ยง FK constraint
        await prisma.$transaction(async (tx) => {
          await tx.minigamePlay.deleteMany({ where: { userId } });
          await tx.review.deleteMany({ where: { userId } });
          await tx.claim.deleteMany({ where: { userId } });
          await tx.topup.deleteMany({ where: { userId } });
          const orders = await tx.order.findMany({
            where: { userId },
            select: { id: true },
          });
          const orderIds = orders.map((o) => o.id);
          if (orderIds.length) {
            await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
            await tx.order.deleteMany({ where: { userId } });
          }
          await tx.user.delete({ where: { id: userId } });
        });
        return NextResponse.json({ ok: true, deleted: true });
      }

      default:
        return NextResponse.json({ ok: false, error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });
    }
  } catch (err) {
    console.error("[admin:users]", err);
    return NextResponse.json({ ok: false, error: "ทำรายการไม่สำเร็จ" }, { status: 500 });
  }
}
