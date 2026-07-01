import Link from "next/link";
import { SectionHeading } from "@/components/store/SectionHeading";
import { MinigameSpinner } from "@/components/store/MinigameSpinner";
import { getActiveMinigame } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export default async function MinigamePage() {
  const minigame = await getActiveMinigame();

  return (
    <div className="container max-w-lg space-y-6 py-8">
      <SectionHeading title="มินิเกม" subtitle="สุ่มรางวัลและลุ้นโชคใหญ่!" />

      {minigame ? (
        <MinigameSpinner
          minigame={{
            id: minigame.id,
            name: minigame.name,
            imageUrl: minigame.imageUrl,
            priceBaht: minigame.priceBaht,
            usePoints: minigame.usePoints,
            prizeNames: minigame.prizes.map((p) => p.name),
          }}
        />
      ) : (
        <div className="rounded-3xl border border-dashed border-primary/30 bg-card p-12 text-center">
          <p className="text-muted-foreground">ยังไม่มีมินิเกมที่เปิดใช้งาน</p>
          <Link
            href="/"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border-2 border-primary/30 bg-white px-5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            กลับหน้าแรก
          </Link>
        </div>
      )}
    </div>
  );
}
