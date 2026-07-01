"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** ปรับความกว้างสูงสุดของหน้าต่าง เช่น "max-w-4xl" (ค่าเริ่มต้น max-w-lg) */
  className?: string;
}

export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open || !mounted) return null;

  // render ผ่าน portal ที่ body เพื่อให้ fixed อิงกับ viewport เสมอ (dialog อยู่กลางจอแน่นอน
  // ไม่โดน transform/animation ของ parent ทำให้ตำแหน่งเพี้ยน)
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-up"
        onClick={() => onOpenChange(false)}
      />
      <div className={cn("relative z-10 w-full max-w-lg animate-pop", className)}>{children}</div>
    </div>,
    document.body,
  );
}

export function DialogContent({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "relative max-h-[85vh] overflow-y-auto rounded-3xl border-2 border-white bg-card p-6 shadow-kawaii",
        className,
      )}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <X className="size-5" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-4 space-y-1", className)}>{children}</div>;
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn("text-xl font-bold text-primary", className)}>{children}</h2>;
}

export function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)}>{children}</div>;
}
