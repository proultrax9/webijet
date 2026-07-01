"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Loader2, Image as ImageIcon, Coins, Gift, CalendarClock } from "lucide-react";
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

type CategoryOption = { id: string; name: string };

export type ProductData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  downloadUrl: string | null;
  videoUrl: string | null;
  duration: string | null;
  price: number;
  resellerPrice: number | null;
  discountPct: number | null;
  stock: number;
  priority: number;
  minQty: number;
  maxQty: number;
  featured: boolean;
  bestseller: boolean;
  special: boolean;
  warranty: boolean;
  isPreorder: boolean;
  requiresInput: boolean;
  isActive: boolean;
  allowPoints: boolean;
  promoBuyQty: number;
  promoFreeQty: number;
  installment: boolean;
  colorPrimary: string | null;
  colorSecondary: string | null;
  badgeLabel: string | null;
  badgeColor: string | null;
  categoryId: string;
};

function CheckItem({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function ProductFormDialog({
  open,
  setOpen,
  product,
  categories,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  product?: ProductData;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const isEdit = !!product;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [downloadUrl, setDownloadUrl] = useState(product?.downloadUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl ?? "");
  const [duration, setDuration] = useState(product?.duration ?? "");
  const [price, setPrice] = useState(String(product?.price ?? 0));
  const [resellerPrice, setResellerPrice] = useState(
    product?.resellerPrice != null ? String(product.resellerPrice) : "",
  );
  const [discountPct, setDiscountPct] = useState(
    product?.discountPct != null ? String(product.discountPct) : "0",
  );
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [priority, setPriority] = useState(String(product?.priority ?? 0));
  const [minQty, setMinQty] = useState(String(product?.minQty ?? 1));
  const [maxQty, setMaxQty] = useState(String(product?.maxQty ?? 1000));
  const [allowPoints, setAllowPoints] = useState(product?.allowPoints ?? false);
  const [promoBuyQty, setPromoBuyQty] = useState(String(product?.promoBuyQty ?? 0));
  const [promoFreeQty, setPromoFreeQty] = useState(String(product?.promoFreeQty ?? 0));
  const [installment, setInstallment] = useState(product?.installment ?? false);
  const [colorPrimary, setColorPrimary] = useState(product?.colorPrimary ?? "");
  const [colorSecondary, setColorSecondary] = useState(product?.colorSecondary ?? "");
  const [badgeLabel, setBadgeLabel] = useState(product?.badgeLabel ?? "");
  const [badgeColor, setBadgeColor] = useState(product?.badgeColor ?? "");
  const [special, setSpecial] = useState(product?.special ?? false);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [bestseller, setBestseller] = useState(product?.bestseller ?? false);
  const [warranty, setWarranty] = useState(product?.warranty ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isPreorder, setIsPreorder] = useState(product?.isPreorder ?? false);
  const [requiresInput, setRequiresInput] = useState(product?.requiresInput ?? false);

  async function submit() {
    if (!name.trim()) return alert("กรุณากรอกชื่อสินค้า");
    if (!categoryId) return alert("กรุณาเลือกหมวดหมู่");
    setLoading(true);
    try {
      const payload = {
        ...(isEdit ? { id: product!.id } : {}),
        name,
        categoryId,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        downloadUrl: downloadUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        duration: duration.trim() || undefined,
        price: Number(price) || 0,
        resellerPrice: resellerPrice.trim() === "" ? "" : Number(resellerPrice),
        discountPct: discountPct.trim() === "" ? "" : Number(discountPct),
        stock: Number(stock) || 0,
        priority: Number(priority) || 0,
        minQty: Number(minQty) || 1,
        maxQty: Number(maxQty) || 1000,
        allowPoints,
        promoBuyQty: Number(promoBuyQty) || 0,
        promoFreeQty: Number(promoFreeQty) || 0,
        installment,
        colorPrimary: colorPrimary.trim() || undefined,
        colorSecondary: colorSecondary.trim() || undefined,
        badgeLabel: badgeLabel.trim() || undefined,
        badgeColor: badgeColor.trim() || undefined,
        special,
        featured,
        bestseller,
        warranty,
        isActive,
        isPreorder,
        requiresInput,
      };
      const res = await fetch("/api/admin/products", {
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
    <Dialog open={open} onOpenChange={setOpen} className="max-w-4xl">
      <DialogContent onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>หมวดหมู่ *</Label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="" disabled>
                  เลือกหมวดหมู่
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>ชื่อสินค้า *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อสินค้า"
              />
            </div>
          </div>

          <div>
            <Label>คำอธิบาย</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายสินค้า (สามารถเว้นวรรคได้)"
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>ราคา *</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label>ราคาขายส่ง</Label>
              <Input
                type="number"
                value={resellerPrice}
                onChange={(e) => setResellerPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>รูปภาพ</Label>
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
              <Label>ลิงก์ดาวน์โหลด</Label>
              <Input
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/download"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>ลิงก์วิดีโอ</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label>ระยะเวลา</Label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30 วัน"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>ส่วนลด (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>ลำดับความสำคัญ</Label>
              <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>สต็อคเริ่มต้น</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>จำนวนขั้นต่ำที่ซื้อได้</Label>
                <Input type="number" min={1} value={minQty} onChange={(e) => setMinQty(e.target.value)} placeholder="1" />
              </div>
              <div>
                <Label>จำนวนสูงสุดที่ซื้อได้</Label>
                <Input type="number" min={1} value={maxQty} onChange={(e) => setMaxQty(e.target.value)} placeholder="1000" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/25 bg-accent/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Coins className="size-4 text-primary" />
              ระบบแต้ม
            </h3>
            <CheckItem checked={allowPoints} onChange={setAllowPoints} label="อนุญาตให้ซื้อด้วยแต้ม" />
          </div>

          <div className="rounded-xl border border-primary/25 bg-accent/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Gift className="size-4 text-primary" />
              โปรโมชันซื้อแถม
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>ซื้อจำนวน (ชิ้น)</Label>
                <Input
                  type="number"
                  min={0}
                  value={promoBuyQty}
                  onChange={(e) => setPromoBuyQty(e.target.value)}
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  จำนวนสินค้าที่ต้องซื้อเพื่อรับโปรโมชัน (0 = ปิดโปรโมชัน)
                </p>
              </div>
              <div>
                <Label>แถมจำนวน (ชิ้น)</Label>
                <Input
                  type="number"
                  min={0}
                  value={promoFreeQty}
                  onChange={(e) => setPromoFreeQty(e.target.value)}
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  จำนวนสินค้าที่จะแถมให้ (0 = ปิดโปรโมชัน)
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/25 bg-accent/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="size-4 text-primary" />
              ระบบผ่อนชำระ
            </h3>
            <CheckItem checked={installment} onChange={setInstallment} label="เปิดใช้งานระบบผ่อนชำระ" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="สีหลัก" value={colorPrimary} onChange={setColorPrimary} placeholder="#3B82F6" />
            <ColorField label="สีรอง" value={colorSecondary} onChange={setColorSecondary} placeholder="#6B7280" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Custom Badge Label</Label>
              <Input
                value={badgeLabel}
                onChange={(e) => setBadgeLabel(e.target.value)}
                placeholder="เช่น: สินค้าใหม่, ขายดี, จำกัดเวลา"
              />
            </div>
            <ColorField
              label="Custom Badge Label Color"
              value={badgeColor}
              onChange={setBadgeColor}
              placeholder="#8b5cf6"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border p-3">
            <CheckItem checked={special} onChange={setSpecial} label="สินค้าพิเศษ" />
            <CheckItem checked={featured} onChange={setFeatured} label="แนะนำ" />
            <CheckItem checked={bestseller} onChange={setBestseller} label="ขายดี" />
            <CheckItem checked={warranty} onChange={setWarranty} label="รับประกัน" />
            <CheckItem checked={isActive} onChange={setIsActive} label="เปิดใช้งาน" />
            <CheckItem checked={isPreorder} onChange={setIsPreorder} label="สินค้าแบบออเดอร์" />
            <CheckItem checked={requiresInput} onChange={setRequiresInput} label="จำเป็นต้องกรอกข้อมูล" />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={loading || categories.length === 0} className="min-w-32">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "อัปเดต" : "สร้างสินค้า"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateProductButton({ categories }: { categories: CategoryOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        เพิ่มสินค้าใหม่
      </Button>
      {open && <ProductFormDialog open={open} setOpen={setOpen} categories={categories} />}
    </>
  );
}

export function EditProductButton({
  product,
  categories,
}: {
  product: ProductData;
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="icon-sm" variant="outline" onClick={() => setOpen(true)} aria-label="แก้ไข">
        <Pencil className="size-4" />
      </Button>
      {open && (
        <ProductFormDialog open={open} setOpen={setOpen} product={product} categories={categories} />
      )}
    </>
  );
}
