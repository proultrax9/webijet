"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, CheckCircle2, XCircle, Copy, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatBaht } from "@/lib/utils";

type BuyResult =
  | { ok: true; billNumber: string; delivered: string | null; newBalance: number }
  | { ok: false; error: string };

export function BuyButton({
  productId,
  price,
  soldOut,
  disabled,
  minQty = 1,
  maxQty = 1,
  stock = 1,
  promoBuyQty = 0,
  promoFreeQty = 0,
}: {
  productId: string;
  price: number;
  soldOut?: boolean;
  disabled?: boolean;
  minQty?: number;
  maxQty?: number;
  stock?: number;
  promoBuyQty?: number;
  promoFreeQty?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<BuyResult | null>(null);

  const lowest = Math.max(1, minQty);
  const highest = Math.max(lowest, Math.min(maxQty, stock));
  const [qty, setQty] = useState(lowest);
  const clamp = (n: number) => Math.max(lowest, Math.min(highest, Math.trunc(n) || lowest));
  const freeQty =
    promoBuyQty > 0 && promoFreeQty > 0 ? Math.floor(qty / promoBuyQty) * promoFreeQty : 0;

  async function buy() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      const data = (await res.json()) as BuyResult;
      setResult(data);
      setOpen(true);
      if (data.ok) router.refresh();
    } catch {
      setResult({ ok: false, error: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง" });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!soldOut && highest > 1 && (
        <div className="mb-3 flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">จำนวน</span>
          <div className="flex items-center rounded-xl border bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setQty((q) => clamp(q - 1))}
              disabled={qty <= lowest}
              className="grid size-10 place-items-center rounded-l-xl text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
              aria-label="ลดจำนวน"
            >
              <Minus className="size-4" />
            </button>
            <input
              type="number"
              min={lowest}
              max={highest}
              value={qty}
              onChange={(e) => setQty(clamp(Number(e.target.value)))}
              className="h-10 w-16 border-x text-center text-sm font-bold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setQty((q) => clamp(q + 1))}
              disabled={qty >= highest}
              className="grid size-10 place-items-center rounded-r-xl text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
              aria-label="เพิ่มจำนวน"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            ขั้นต่ำ {lowest} · สูงสุด {highest}
          </span>
        </div>
      )}

      {freeQty > 0 && (
        <p className="mb-3 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm font-semibold text-success">
          🎁 โปรโมชัน: ซื้อ {qty} ชิ้น แถมฟรีอีก {freeQty} ชิ้น!
        </p>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={buy}
        disabled={loading || soldOut || disabled}
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" /> กำลังดำเนินการ...
          </>
        ) : soldOut ? (
          "สินค้าหมด"
        ) : (
          <>
            <ShoppingBag className="size-5" /> ซื้อเลย · {formatBaht(price * qty)}
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          {result?.ok ? (
            <>
              <DialogHeader>
                <div className="mb-2 flex justify-center">
                  <span className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
                    <CheckCircle2 className="size-9" />
                  </span>
                </div>
                <DialogTitle className="text-center text-success">ซื้อสำเร็จ! 🎉</DialogTitle>
                <DialogDescription className="text-center">
                  เลขที่บิล {result.billNumber}
                </DialogDescription>
              </DialogHeader>

              {result.delivered && (
                <div className="rounded-2xl border border-primary/15 bg-accent/50 p-4">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">
                    ข้อมูลสินค้าของคุณ
                  </p>
                  <div className="flex items-start justify-between gap-2">
                    <code className="whitespace-pre-wrap break-all text-sm font-medium text-foreground">
                      {result.delivered}
                    </code>
                    <button
                      onClick={() => navigator.clipboard?.writeText(result.delivered ?? "")}
                      className="shrink-0 rounded-lg p-1.5 text-primary hover:bg-primary/10"
                      aria-label="คัดลอก"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                </div>
              )}

              <p className="mt-4 text-center text-sm text-muted-foreground">
                ยอดเงินคงเหลือ:{" "}
                <span className="font-bold text-primary">{formatBaht(result.newBalance)}</span>
              </p>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="mb-2 flex justify-center">
                  <span className="grid size-16 place-items-center rounded-full bg-danger/15 text-danger">
                    <XCircle className="size-9" />
                  </span>
                </div>
                <DialogTitle className="text-center text-danger">ไม่สำเร็จ</DialogTitle>
                <DialogDescription className="text-center">
                  {result?.error ?? "เกิดข้อผิดพลาด"}
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
