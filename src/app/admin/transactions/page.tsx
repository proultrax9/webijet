import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatBaht, formatThaiDate } from "@/lib/utils";
import { TOPUP_METHOD_LABEL, TOPUP_STATUS_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

function TransactionTable({
  rows,
  type,
}: {
  type: "sales" | "topup";
  rows: {
    id: string;
    billOrRef: string;
    username: string;
    email: string;
    amount: number;
    createdAt: Date;
    extra?: string;
  }[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{type === "sales" ? "เลขที่บิล" : "อ้างอิง"}</TableHead>
          <TableHead>ผู้ใช้</TableHead>
          <TableHead>{type === "sales" ? "ราคารวม" : "จำนวน"}</TableHead>
          {type === "topup" && <TableHead>ช่องทาง</TableHead>}
          <TableHead>วันที่สร้าง</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={type === "topup" ? 5 : 4} className="py-12 text-center text-muted-foreground">
              ไม่มีข้อมูลธุรกรรม
            </TableCell>
          </TableRow>
        ) : (
          rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.billOrRef}</TableCell>
              <TableCell>
                <p className="font-semibold">{r.username}</p>
                <p className="text-xs text-muted-foreground">{r.email}</p>
              </TableCell>
              <TableCell className="font-bold text-danger">{formatBaht(r.amount)}</TableCell>
              {type === "topup" && (
                <TableCell>
                  <Badge variant="muted">{r.extra}</Badge>
                </TableCell>
              )}
              <TableCell className="text-sm">{formatThaiDate(r.createdAt)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const tab = searchParams.tab === "topup" ? "topup" : "sales";

  const [orders, topups] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { username: true, email: true } } },
    }),
    prisma.topup.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { username: true, email: true } } },
    }),
  ]);

  const salesRows = orders.map((o) => ({
    id: o.id,
    billOrRef: o.billNumber,
    username: o.user.username,
    email: o.user.email,
    amount: o.totalPrice,
    createdAt: o.createdAt,
  }));

  const topupRows = topups.map((t) => ({
    id: t.id,
    billOrRef: t.reference ?? t.id.slice(0, 12),
    username: t.user.username,
    email: t.user.email,
    amount: t.amount,
    createdAt: t.createdAt,
    extra:
      TOPUP_METHOD_LABEL[t.method as keyof typeof TOPUP_METHOD_LABEL] ??
      TOPUP_STATUS_LABEL[t.status as keyof typeof TOPUP_STATUS_LABEL] ??
      t.method,
  }));

  return (
    <div>
      <PageHeader
        icon={<ArrowLeftRight className="size-6" />}
        title="จัดการธุรกรรม"
        subtitle="ดูและจัดการรายการธุรกรรมการขายและการเติมเงินทั้งหมด"
        actions={
          <Button variant="outline">
            <RefreshCw className="size-4" />
            รีเฟรชข้อมูล
          </Button>
        }
      />

      <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
        โหลดข้อมูลธุรกรรมสำเร็จ
      </div>

      <div className="mb-4 rounded-2xl border bg-card p-4 shadow-soft">
        <form className="grid gap-3 md:grid-cols-4">
          <div>
            <Label>ชื่อผู้ใช้</Label>
            <Input name="q" defaultValue={searchParams.q} placeholder="ค้นหาตามชื่อผู้ใช้" />
          </div>
          <div>
            <Label>เรียงตาม</Label>
            <Select defaultValue="createdAt">
              <option value="createdAt">วันที่สร้าง</option>
            </Select>
          </div>
          <div>
            <Label>ทิศทาง</Label>
            <Select defaultValue="desc">
              <option value="desc">มากไปน้อย</option>
              <option value="asc">น้อยไปมาก</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="ghost">
              รีเซ็ตตัวกรอง
            </Button>
          </div>
        </form>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="sales">ธุรกรรมการขาย</TabsTrigger>
          <TabsTrigger value="topup">การเติมเงิน</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-4 rounded-2xl border bg-card p-4 shadow-soft">
          <TransactionTable type="sales" rows={salesRows} />
        </TabsContent>
        <TabsContent value="topup" className="mt-4 rounded-2xl border bg-card p-4 shadow-soft">
          <TransactionTable type="topup" rows={topupRows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
