"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type CategoryOption = { id: string; name: string };

export function CreateCategoryButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [priority, setPriority] = useState("0");
  const [featured, setFeatured] = useState(false);

  async function submit() {
    if (!name.trim()) return alert("กรุณากรอกชื่อหมวดหมู่");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug || undefined, priority: Number(priority), featured }),
      });
      const data = await res.json();
      if (!data.ok) alert(data.error ?? "สร้างไม่สำเร็จ");
      else {
        setOpen(false);
        setName("");
        setSlug("");
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
        เพิ่มหมวดหมู่ใหม่
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>ชื่อหมวดหมู่ *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Blox Spin" />
            </div>
            <div>
              <Label>SLUG (ว่าง = สร้างอัตโนมัติ)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="blox-spin" />
            </div>
            <div>
              <Label>Priority</Label>
              <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
            </div>
            <label className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm font-medium">Featured</span>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={submit} disabled={loading}>
              สร้างหมวดหมู่
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CreateProductButton({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [priority, setPriority] = useState("0");
  const [featured, setFeatured] = useState(false);

  async function submit() {
    if (!name.trim()) return alert("กรุณากรอกชื่อสินค้า");
    if (!categoryId) return alert("กรุณาเลือกหมวดหมู่");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId,
          price: Number(price),
          stock: Number(stock),
          priority: Number(priority),
          featured,
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
        เพิ่มสินค้าใหม่
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>ชื่อสินค้า *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mega Seed Pack" />
            </div>
            <div>
              <Label>หมวดหมู่ *</Label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ราคา (บาท)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div>
                <Label>สต็อก</Label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Priority</Label>
              <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
            </div>
            <label className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm font-medium">สินค้าแนะนำ</span>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={submit} disabled={loading || categories.length === 0}>
              สร้างสินค้า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
