import {
  BarChart3,
  DollarSign,
  Download,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { DashboardChartsSection } from "@/components/admin/DashboardCharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { formatBaht } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAYS = 30;
const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function thaiShort(d: Date) {
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`;
}

export default async function DashboardPage() {
  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const [orders, users, topups, orderItems, categories] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { totalPrice: true, status: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.topup.findMany({
      where: { createdAt: { gte: since } },
      select: { amount: true, status: true, createdAt: true },
    }),
    prisma.orderItem.findMany({
      include: {
        product: { select: { name: true, category: { select: { name: true } } } },
      },
    }),
    prisma.category.findMany({ select: { name: true } }),
  ]);

  // ===== KPI =====
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const totalRevenue = completedOrders.reduce((s, o) => s + o.totalPrice, 0);
  const salesCount = completedOrders.length;
  const avgOrder = salesCount ? Math.round(totalRevenue / salesCount) : 0;
  const newUsersCount = users.length;
  const successTopups = topups.filter((t) => t.status === "SUCCESS");
  const topupTotal = successTopups.reduce((s, t) => s + t.amount, 0);

  // ===== เตรียม buckets รายวัน 30 วัน =====
  const days: Date[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    days.push(d);
  }
  const revMap = new Map<string, { orders: number; revenue: number }>();
  const userMap = new Map<string, number>();
  const topupMap = new Map<string, number>();
  days.forEach((d) => {
    const k = dayKey(d);
    revMap.set(k, { orders: 0, revenue: 0 });
    userMap.set(k, 0);
    topupMap.set(k, 0);
  });

  for (const o of completedOrders) {
    const k = dayKey(new Date(o.createdAt));
    const cur = revMap.get(k);
    if (cur) {
      cur.orders += 1;
      cur.revenue += o.totalPrice;
    }
  }
  for (const u of users) {
    const k = dayKey(new Date(u.createdAt));
    if (userMap.has(k)) userMap.set(k, (userMap.get(k) ?? 0) + 1);
  }
  for (const t of successTopups) {
    const k = dayKey(new Date(t.createdAt));
    if (topupMap.has(k)) topupMap.set(k, (topupMap.get(k) ?? 0) + t.amount);
  }

  const revenueSeries = days.map((d) => {
    const v = revMap.get(dayKey(d))!;
    return { date: thaiShort(d), orders: v.orders, revenue: Math.round(v.revenue) };
  });
  const newUsersSeries = days.map((d) => ({
    date: thaiShort(d),
    count: userMap.get(dayKey(d)) ?? 0,
  }));
  const topupSeries = days.map((d) => ({
    date: thaiShort(d),
    amount: Math.round(topupMap.get(dayKey(d)) ?? 0),
  }));

  // ===== สินค้าขายดี + หมวดหมู่ (จาก order items ทั้งหมด) =====
  const productCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  for (const cat of categories) categoryCount.set(cat.name, 0);
  for (const item of orderItems) {
    const pName = item.product?.name ?? "ไม่ทราบ";
    productCount.set(pName, (productCount.get(pName) ?? 0) + 1);
    const cName = item.product?.category?.name ?? "อื่นๆ";
    categoryCount.set(cName, (categoryCount.get(cName) ?? 0) + 1);
  }
  const topProducts = [...productCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const categoryBreakdown = [...categoryCount.entries()]
    .map(([name, value]) => ({ name, value }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <PageHeader
        icon={<BarChart3 className="size-6" />}
        title="รายงานการเงิน & สถิติ"
        subtitle="ภาพรวมประสิทธิภาพทางธุรกิจของคุณ"
        actions={
          <>
            <Select defaultValue="30" className="h-10 w-40">
              <option value="7">7 วันล่าสุด</option>
              <option value="30">30 วันล่าสุด</option>
              <option value="90">90 วันล่าสุด</option>
            </Select>
            <Button variant="default">
              <RefreshCw className="size-4" />
              รีเฟรช
            </Button>
          </>
        }
      />

      {/* Export card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Download className="size-5" />
            ส่งออกรายการเติมเงิน
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            กำหนดช่วงวันที่แล้วส่งออกเป็น CSV หรือ Excel (แยกไฟล์ตามช่องทาง) — ถ้าไม่ระบุวันที่
            ระบบจะดึงรายการทั้งหมดตามสิทธิ์ API
          </p>
        </CardHeader>
        <CardContent>
          <form
            action="/api/admin/export/topups"
            method="get"
            className="flex flex-wrap items-end gap-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="start">วันที่เริ่มต้น</Label>
              <Input id="start" name="start" type="date" className="w-48" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end">วันที่สิ้นสุด</Label>
              <Input id="end" name="end" type="date" className="w-48" />
            </div>
            <Button type="submit" name="format" value="csv" variant="outline">
              <Download className="size-4" />
              ส่งออก CSV
            </Button>
            <Button type="submit" name="format" value="excel" variant="outline">
              <Download className="size-4" />
              ส่งออก Excel
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="รายได้ทั้งหมด"
          value={formatBaht(totalRevenue)}
          unit="บาท"
          icon={<DollarSign className="size-6" />}
        />
        <StatCard
          label="จำนวนการขาย"
          value={salesCount}
          unit="ออเดอร์"
          icon={<ShoppingCart className="size-6" />}
        />
        <StatCard
          label="มูลค่าเฉลี่ย/ออเดอร์"
          value={avgOrder}
          unit="บาท"
          icon={<TrendingUp className="size-6" />}
        />
        <StatCard
          label="ผู้ใช้ใหม่"
          value={newUsersCount}
          unit="คน"
          icon={<Users className="size-6" />}
        />
        <StatCard
          label="ยอดเติมเงิน"
          value={formatBaht(topupTotal)}
          unit="บาท"
          icon={<Wallet className="size-6" />}
        />
      </div>

      {/* Charts */}
      <DashboardChartsSection
        revenue={revenueSeries}
        newUsers={newUsersSeries}
        topup={topupSeries}
        topProducts={topProducts}
        categories={categoryBreakdown}
      />
    </div>
  );
}
