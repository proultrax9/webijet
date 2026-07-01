"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function CreateMinigameButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceBaht, setPriceBaht] = useState("10");
  const [sortOrder, setSortOrder] = useState("0");
  const [usePoints, setUsePoints] = useState(false);
  const [isActive, setIsActive] = useState(true);

  async function submit() {
    if (!name.trim()) return alert("กรุณากรอกชื่อมินิเกม");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/minigames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          priceBaht: Number(priceBaht),
          sortOrder: Number(sortOrder),
          usePoints,
          isActive,
        }),
      });
      const data = await res.json();
      if (!data.ok) alert(data.error ?? "สร้างไม่สำเร็จ");
      else {
        setOpen(false);
        setName("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        เพิ่มมินิเกม
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>สร้างมินิเกมใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>ชื่อมินิเกม *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="เกมสุ่มรางวัล" />
            </div>
            <div>
              <Label>คำอธิบาย</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ราคาเล่น (บาท)</Label>
                <Input type="number" value={priceBaht} onChange={(e) => setPriceBaht(e.target.value)} />
              </div>
              <div>
                <Label>ลำดับ</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm font-medium">เล่นด้วยแต้ม</span>
              <Switch checked={usePoints} onCheckedChange={setUsePoints} />
            </label>
            <label className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm font-medium">เปิดใช้งาน</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={submit} disabled={loading}>
              สร้างมินิเกม
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
