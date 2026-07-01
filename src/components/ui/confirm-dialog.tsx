"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "ลบถาวร",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-md">
      <DialogContent>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid size-20 place-items-center rounded-full border-4 border-amber-400/70 text-amber-500">
            <span className="text-4xl font-black">!</span>
          </span>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="mt-2 flex gap-3">
            <Button variant="danger" onClick={handleConfirm} disabled={loading} className="min-w-28">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {confirmLabel}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="min-w-24 border-transparent bg-muted text-foreground hover:bg-muted/70"
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
