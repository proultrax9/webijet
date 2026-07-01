import { ShieldAlert, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatChip } from "@/components/admin/StatChip";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { CLAIM_STATUS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminClaimsPage() {
  const claims = await prisma.claim.findMany({ select: { status: true } });
  const counts = {
    total: claims.length,
    pending: claims.filter((c) => c.status === CLAIM_STATUS.PENDING).length,
    processing: claims.filter((c) => c.status === CLAIM_STATUS.IN_PROGRESS).length,
    rejected: claims.filter((c) => c.status === CLAIM_STATUS.REJECTED).length,
    completed: claims.filter((c) => c.status === CLAIM_STATUS.COMPLETED).length,
  };

  return (
    <div>
      <PageHeader
        icon={<ShieldAlert className="size-6" />}
        title="จัดการเคลมสินค้า"
        subtitle="ดูและปรับปรุงสถานะของคำร้องเคลมสินค้า"
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
        <StatChip label="ดำเนินการ" value={counts.processing} />
        <StatChip label="ปฏิเสธ" value={counts.rejected} />
        <StatChip label="เสร็จสิ้น" value={counts.completed} />
      </div>

      <EmptyState title="ไม่มีคำร้องเคลมในเงื่อนไขที่เลือก" />
    </div>
  );
}
