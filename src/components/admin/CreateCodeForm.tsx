"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("100");
  const [maxUses, setMaxUses] = useState("20");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          amount: Number(amount),
          maxUses: Number(maxUses),
        }),
      });
      const data = await res.json();
      if (!data.ok) alert(data.error ?? "สร้างไม่สำเร็จ");
      else {
        setCode("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4 shadow-soft"
    >
      <div className="space-y-1">
        <Label>รหัสโค้ด</Label>
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="NEWSHOP" required />
      </div>
      <div className="space-y-1">
        <Label>จำนวนเงิน (บาท)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label>ใช้ได้ (ครั้ง)</Label>
        <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} required />
      </div>
      <Button type="submit" disabled={loading}>
        + สร้างโค้ดใหม่
      </Button>
    </form>
  );
}
