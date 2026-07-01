import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet, Coins, ShoppingBag } from "lucide-react";
import { SectionHeading } from "@/components/store/SectionHeading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatBaht, formatThaiDate } from "@/lib/utils";
import {
  ORDER_STATUS_LABEL,
  TOPUP_METHOD_LABEL,
  TOPUP_STATUS_LABEL,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [orders, topups] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.topup.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="container space-y-8 py-8">
      <SectionHeading title="โปรไฟล์" subtitle={`${user.username} · ${user.email}`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/70 bg-card p-4 shadow-soft">
          <Wallet className="mb-2 size-6 text-primary" />
          <p className="text-sm text-muted-foreground">ยอดเงินคงเหลือ</p>
          <p className="text-2xl font-extrabold text-primary">{formatBaht(user.balance)}</p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-card p-4 shadow-soft">
          <Coins className="mb-2 size-6 text-secondary" />
          <p className="text-sm text-muted-foreground">แต้มสะสม</p>
          <p className="text-2xl font-extrabold text-secondary">{user.points} แต้ม</p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-card p-4 shadow-soft">
          <ShoppingBag className="mb-2 size-6 text-success" />
          <p className="text-sm text-muted-foreground">ออเดอร์ทั้งหมด</p>
          <p className="text-2xl font-extrabold">{orders.length}</p>
        </div>
      </div>

      <Link
        href="/topup"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-gradient px-5 text-sm font-medium text-white shadow-kawaii"
      >
        เติมเงิน
      </Link>

      <section id="orders" className="scroll-mt-24">
        <h2 className="mb-3 text-lg font-bold">ประวัติการซื้อ</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการซื้อ</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่บิล</TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead>ราคา</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.billNumber}</TableCell>
                  <TableCell>
                    {o.items.map((i) => i.product?.name ?? i.productName ?? "สินค้าถูกลบไปแล้ว").join(", ")}
                  </TableCell>
                  <TableCell className="font-bold text-danger">{formatBaht(o.totalPrice)}</TableCell>
                  <TableCell>
                    <Badge variant="muted">
                      {ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL] ?? o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{formatThaiDate(o.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section id="topups" className="scroll-mt-24">
        <h2 className="mb-3 text-lg font-bold">ประวัติการเติมเงิน</h2>
        {topups.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการเติมเงิน</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ช่องทาง</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topups.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    {TOPUP_METHOD_LABEL[t.method as keyof typeof TOPUP_METHOD_LABEL] ?? t.method}
                  </TableCell>
                  <TableCell className="font-bold text-success">{formatBaht(t.amount)}</TableCell>
                  <TableCell>
                    {TOPUP_STATUS_LABEL[t.status as keyof typeof TOPUP_STATUS_LABEL] ?? t.status}
                  </TableCell>
                  <TableCell className="text-xs">{formatThaiDate(t.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
