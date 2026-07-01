"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteCategoryButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm("ลบหมวดหมู่นี้?")) return;
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) alert(data.error ?? "ลบไม่สำเร็จ");
    router.refresh();
  }

  return (
    <Button size="icon-sm" variant="danger" onClick={remove} aria-label="ลบ">
      <Trash2 className="size-4" />
    </Button>
  );
}

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm("ลบสินค้านี้?")) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) alert(data.error ?? "ลบไม่สำเร็จ");
    router.refresh();
  }

  return (
    <Button size="icon-sm" variant="danger" onClick={remove} aria-label="ลบ">
      <Trash2 className="size-4" />
    </Button>
  );
}

export function DeleteCodeButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm("ลบโค้ดนี้?")) return;
    const res = await fetch(`/api/admin/codes?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) alert(data.error ?? "ลบไม่สำเร็จ");
    router.refresh();
  }

  return (
    <Button size="icon-sm" variant="danger" onClick={remove} aria-label="ลบ">
      <Trash2 className="size-4" />
    </Button>
  );
}
