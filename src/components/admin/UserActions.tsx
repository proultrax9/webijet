"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldMinus,
  Ban,
  ShieldOff,
  Trash2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type BanDuration = "1" | "7" | "30" | "permanent";

const BAN_OPTIONS: { value: BanDuration; label: string }[] = [
  { value: "1", label: "แบน 1 วัน" },
  { value: "7", label: "แบน 7 วัน" },
  { value: "30", label: "แบน 30 วัน" },
  { value: "permanent", label: "แบนถาวร" },
];

export function UserActions({
  userId,
  role,
  isSelf,
  banned,
}: {
  userId: string;
  role: string;
  isSelf: boolean;
  banned: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [banMenuOpen, setBanMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isAdmin = role === "ADMIN";

  async function run(action: string, extra?: Record<string, unknown>) {
    setLoading(action);
    setBanMenuOpen(false);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error ?? "ทำรายการไม่สำเร็จ");
        setLoading(null);
        return;
      }
      router.refresh();
    } catch {
      alert("เชื่อมต่อไม่สำเร็จ");
    }
    setLoading(null);
  }

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">บัญชีคุณ</span>;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {/* เลื่อน/ลดสิทธิ์ */}
      <Button
        size="sm"
        variant={isAdmin ? "outline" : "default"}
        onClick={() => run(isAdmin ? "demote" : "promote")}
        disabled={loading !== null}
      >
        {loading === "promote" || loading === "demote" ? (
          <Loader2 className="animate-spin" />
        ) : isAdmin ? (
          <ShieldMinus />
        ) : (
          <ShieldCheck />
        )}
        {isAdmin ? "ลดเป็นผู้ใช้" : "ตั้งเป็นแอดมิน"}
      </Button>

      {/* แบน / ปลดแบน */}
      {banned ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => run("unban")}
          disabled={loading !== null}
        >
          {loading === "unban" ? <Loader2 className="animate-spin" /> : <ShieldOff />}
          ปลดแบน
        </Button>
      ) : (
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBanMenuOpen((o) => !o)}
            disabled={loading !== null}
          >
            {loading === "ban" ? <Loader2 className="animate-spin" /> : <Ban />}
            แบน
            <ChevronDown className="size-3.5" />
          </Button>
          {banMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setBanMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-36 origin-top-right rounded-xl border border-primary/10 bg-white p-1 shadow-kawaii">
                {BAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => run("ban", { duration: opt.value })}
                    className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-primary/10"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ลบผู้ใช้ */}
      <Button
        size="sm"
        variant="outline"
        className="border-danger/40 text-danger hover:bg-danger/10"
        onClick={() => setConfirmDelete(true)}
        disabled={loading !== null}
      >
        {loading === "delete" ? <Loader2 className="animate-spin" /> : <Trash2 />}
        ลบ
      </Button>

      {confirmDelete && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="ยืนยันการลบผู้ใช้"
          description="คุณต้องการลบผู้ใช้นี้ถาวรหรือไม่? ข้อมูลออเดอร์/เติมเงิน/รีวิวทั้งหมดจะถูกลบและไม่สามารถย้อนกลับได้"
          onConfirm={() => run("delete")}
        />
      )}
    </div>
  );
}
