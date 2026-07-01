import { ShoppingBag, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatChip } from "@/components/admin/StatChip";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ select: { status: true } });
  const counts = {
    total: orders.length,
    pending: orders.filter((o) => o.status === ORDER_STATUS.PENDING).length,
    processing: orders.filter((o) => o.status === ORDER_STATUS.PROCESSING).length,
    completed: orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).length,
    canceled: orders.filter((o) => o.status === ORDER_STATUS.CANCELED).length,
  };

  return (
    <div>
      <PageHeader
        icon={<ShoppingBag className="size-6" />}
        title="จัดการออเดอร์"
        subtitle="ดูแลและปรับปรุงสถานะของคำสั่งซื้อที่ต้องจัดการ"
        actions={
          <Button>
            <RefreshCw className="size-4" />
            รีเฟรชข้อมูล
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatChip label="ทั้งหมด" value={counts.total} />
        <StatChip label="รอดำเนินการ" value={counts.pending} />
        <StatChip label="กำลังดำเนินการ" value={counts.processing} />
        <StatChip label="เสร็จสมบูรณ์" value={counts.completed} />
        <StatChip label="ยกเลิก" value={counts.canceled} />
      </div>

      <Input
        className="mb-4"
        placeholder="ค้นหาตามหมายเลขออเดอร์ / ผู้ใช้ / สินค้า"
      />

      {counts.total === 0 ? (
        <EmptyState title="ไม่มีออเดอร์ในเงื่อนไขที่เลือก" />
      ) : (
        <EmptyState title={`มีออเดอร์ ${counts.total} รายการ — ดูรายละเอียดได้ที่ จัดการธุรกรรม`} />
      )}
    </div>
  );
}
