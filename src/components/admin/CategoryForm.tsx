"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type CategoryData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  priority: number;
  featured: boolean;
  isActive: boolean;
};

export type CategoryOption = { id: string; name: string };

function CategoryFormDialog({
  open,
  setOpen,
  category,
  categories,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  category?: CategoryData;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const isEdit = !!category;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [priority, setPriority] = useState(String(category?.priority ?? 0));
  const [featured, setFeatured] = useState(category?.featured ?? false);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  // ไม่ให้เลือกตัวเองเป็นหมวดหมู่หลัก
  const parentOptions = categories.filter((c) => c.id !== category?.id);

  async function submit() {
    if (!name.trim()) return alert("กรุณากรอกชื่อหมวดหมู่");
    setLoading(true);
    try {
      const payload = {
        ...(isEdit ? { id: category!.id } : {}),
        name,
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        parentId: parentId || undefined,
        priority: Number(priority) || 0,
        featured,
        isActive,
      };
      const res = await fetch("/api/admin/categories", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error ?? "บันทึกไม่สำเร็จ");
        setLoading(false);
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      alert("เชื่อมต่อไม่สำเร็จ");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} className="max-w-2xl">
      <DialogContent onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>หมวดหมู่หลัก</Label>
            <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">ไม่มี (หมวดหมู่หลัก)</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>ชื่อหมวดหมู่ *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Blox Spin"
            />
          </div>

          <div>
            <Label>คำอธิบาย</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายหมวดหมู่ (สามารถเว้นว่างได้)"
              rows={3}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ว่าง = สร้างอัตโนมัติจากชื่อ"
            />
          </div>

          <div className="sm:col-span-2">
            <Label>รูปภาพ (URL)</Label>
            <div className="flex items-center gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="preview"
                  className="size-11 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <span className="grid size-11 shrink-0 place-items-center rounded-lg border bg-muted text-muted-foreground">
                  <ImageIcon className="size-5" />
                </span>
              )}
            </div>
          </div>

          <div>
            <Label>ลำดับความสำคัญ</Label>
            <Input
              type="number"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 accent-primary"
              />
              แนะนำ
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 accent-primary"
              />
              เปิดใช้งาน
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={loading} className="min-w-32">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "อัปเดต" : "สร้างหมวดหมู่"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateCategoryButton({ categories }: { categories: CategoryOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        เพิ่มหมวดหมู่ใหม่
      </Button>
      {open && (
        <CategoryFormDialog open={open} setOpen={setOpen} categories={categories} />
      )}
    </>
  );
}

export function EditCategoryButton({
  category,
  categories,
}: {
  category: CategoryData;
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="icon-sm" variant="outline" onClick={() => setOpen(true)} aria-label="แก้ไข">
        <Pencil className="size-4" />
      </Button>
      {open && (
        <CategoryFormDialog
          open={open}
          setOpen={setOpen}
          category={category}
          categories={categories}
        />
      )}
    </>
  );
}
