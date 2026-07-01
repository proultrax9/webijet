import { prisma } from "@/lib/prisma";
import { TOPUP_METHOD_LABEL, TOPUP_STATUS_LABEL } from "@/lib/constants";
import { getAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** escape ค่าหนึ่งช่องสำหรับ CSV (คลุมด้วย " และ escape " ในเนื้อหา) */
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "csv";
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  const where: Record<string, unknown> = {};
  const createdAt: Record<string, Date> = {};
  if (startParam) {
    const d = new Date(startParam);
    if (!Number.isNaN(d.getTime())) createdAt.gte = d;
  }
  if (endParam) {
    const d = new Date(endParam);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      createdAt.lte = d;
    }
  }
  if (Object.keys(createdAt).length) where.createdAt = createdAt;

  const topups = await prisma.topup.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const header = ["วันที่", "ชื่อผู้ใช้", "อีเมล", "ช่องทาง", "จำนวนเงิน", "สถานะ", "อ้างอิง"];
  const rows = topups.map((t) => [
    t.createdAt.toISOString(),
    t.user?.username ?? "",
    t.user?.email ?? "",
    TOPUP_METHOD_LABEL[t.method as keyof typeof TOPUP_METHOD_LABEL] ?? t.method,
    t.amount.toFixed(2),
    TOPUP_STATUS_LABEL[t.status as keyof typeof TOPUP_STATUS_LABEL] ?? t.status,
    t.reference ?? "",
  ]);

  const csvBody = [header, ...rows]
    .map((cols) => cols.map(csvCell).join(","))
    .join("\r\n");

  // BOM เพื่อให้ Excel อ่านภาษาไทยได้ถูกต้อง
  const csv = "﻿" + csvBody;

  const isExcel = format === "excel" || format === "xls";
  const ext = isExcel ? "xls" : "csv";
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": isExcel
        ? "application/vnd.ms-excel; charset=utf-8"
        : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="topups-${stamp}.${ext}"`,
    },
  });
}
