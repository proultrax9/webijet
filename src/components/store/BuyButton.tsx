"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, CheckCircle2, XCircle, Copy } from "lucide-react";
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
}: {
  productId: string;
  price: number;
  soldOut?: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<BuyResult | null>(null);

  async function buy() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
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
            <ShoppingBag className="size-5" /> ซื้อเลย · {formatBaht(price)}
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
                    <code className="break-all text-sm font-medium text-foreground">
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
