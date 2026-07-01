import { Gamepad2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatBaht } from "@/lib/utils";
import { CreateMinigameButton } from "@/components/admin/CreateMinigameForm";

export const dynamic = "force-dynamic";

export default async function AdminMinigamesPage() {
  const minigames = await prisma.minigame.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { plays: true, prizes: true } } },
  });

  return (
    <div>
      <PageHeader
        icon={<Gamepad2 className="size-6" />}
        title="จัดการมินิเกม"
        subtitle="สร้าง แก้ไข หรือลบมินิเกมและรางวัลสำหรับลูกค้าของคุณ"
        actions={<CreateMinigameButton />}
      />

      {minigames.length === 0 ? (
        <EmptyState
          title="ยังไม่มีข้อมูลมินิเกม"
          description="คลิกปุ่ม 'เพิ่มมินิเกม' เพื่อเริ่มต้นสร้างข้อมูลใหม่"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {minigames.map((g) => (
            <div key={g.id} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-primary">{g.name}</h3>
                  <p className="text-sm text-muted-foreground">{g.description}</p>
                </div>
                <Badge variant={g.isActive ? "successSoft" : "muted"}>
                  {g.isActive ? "เปิด" : "ปิด"}
                </Badge>
              </div>
              <p className="mt-3 text-sm">
                ราคาเล่น: {g.usePoints ? `${g.priceBaht} แต้ม` : formatBaht(g.priceBaht)} ·
                รางวัล {g._count.prizes} รายการ · เล่นแล้ว {g._count.plays} ครั้ง
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
