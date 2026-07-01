"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Loader2, Sparkles, PartyPopper, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBaht } from "@/lib/utils";

export interface MinigameSpinnerData {
  id: string;
  name: string;
  imageUrl?: string | null;
  priceBaht: number;
  usePoints: boolean;
  prizeNames: string[];
}

type PlayResult =
  | { ok: true; won: boolean; prizeName: string | null; reward: string }
  | { ok: false; error: string };

export function MinigameSpinner({ minigame }: { minigame: MinigameSpinnerData }) {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<PlayResult | null>(null);

  const cost = minigame.usePoints
    ? `${minigame.priceBaht} แต้ม`
    : formatBaht(minigame.priceBaht);

  async function play() {
    setSpinning(true);
    setResult(null);
    // จำลองแอนิเมชันหมุนก่อนเรียก API
    const started = Date.now();
    try {
      const res = await fetch(`/api/minigames/${minigame.id}/play`, { method: "POST" });
      const data = (await res.json()) as PlayResult;
      const elapsed = Date.now() - started;
      if (elapsed < 1600) await new Promise((r) => setTimeout(r, 1600 - elapsed));
      setResult(data);
      if (data.ok) router.refresh();
    } catch {
      setResult({ ok: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" });
    } finally {
      setSpinning(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br from-accent via-white to-secondary/10 p-6 shadow-kawaii">
      <div className="flex flex-col items-center text-center">
        <div
          className={
            "relative grid size-40 place-items-center rounded-full bg-primary-gradient p-2 shadow-kawaii " +
            (spinning ? "animate-spin" : "")
          }
          style={spinning ? { animationDuration: "0.6s" } : undefined}
        >
          <div className="grid size-full place-items-center overflow-hidden rounded-full bg-white">
            {minigame.imageUrl ? (
              <img
                src={minigame.imageUrl}
                alt={minigame.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Gift className="size-16 text-primary" />
            )}
          </div>
          <Sparkles className="absolute -right-1 -top-1 size-7 text-secondary" />
        </div>

        <h3 className="mt-4 text-xl font-extrabold text-primary">{minigame.name}</h3>
        <p className="text-sm text-muted-foreground">ราคาเล่น {cost}</p>

        {/* รางวัลที่มี */}
        {minigame.prizeNames.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {minigame.prizeNames.map((p, i) => (
              <span
                key={i}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-primary shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        {/* ผลลัพธ์ */}
        {result && (
          <div className="mt-4 w-full animate-pop">
            {result.ok ? (
              result.won ? (
                <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-success">
                  <PartyPopper className="mx-auto mb-1 size-7" />
                  <p className="font-bold">ยินดีด้วย! คุณได้รับ {result.prizeName}</p>
                  <p className="text-xs">{result.reward}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-muted-foreground/20 bg-muted/40 p-4 text-muted-foreground">
                  <Frown className="mx-auto mb-1 size-7" />
                  <p className="font-bold">เสียใจด้วย ยังไม่ได้รางวัลรอบนี้</p>
                  <p className="text-xs">ลองใหม่อีกครั้งนะ 🎀</p>
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger">
                {result.error}
              </div>
            )}
          </div>
        )}

        <Button size="lg" className="mt-5 w-full max-w-xs" onClick={play} disabled={spinning}>
          {spinning ? (
            <>
              <Loader2 className="size-5 animate-spin" /> กำลังสุ่ม...
            </>
          ) : (
            <>
              <Gift className="size-5" /> เล่นเลย!
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
