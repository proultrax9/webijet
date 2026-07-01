import { History } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatChip } from "@/components/admin/StatChip";
import { EmptyState } from "@/components/admin/EmptyState";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MinigameHistoryPage() {
  const plays = await prisma.minigamePlay.findMany();
  const total = plays.length;
  const won = plays.filter((p) => p.won).length;
  const lost = total - won;

  return (
    <div>
      <PageHeader
        icon={<History className="size-6" />}
        title="ประวัติการเล่นมินิเกม"
        subtitle="ดูประวัติการเล่นมินิเกมทั้งหมดของผู้ใช้"
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatChip label="จำนวนทั้งหมด" value={total} />
        <StatChip label="ชนะรางวัล" value={won} />
        <StatChip label="ไม่ชนะรางวัล" value={lost} />
      </div>

      {total === 0 ? (
        <EmptyState title="ยังไม่มีประวัติการเล่น" description="ยังไม่มีข้อมูลประวัติการเล่น" />
      ) : (
        <EmptyState title={`มีประวัติ ${total} รายการ`} />
      )}
    </div>
  );
}
