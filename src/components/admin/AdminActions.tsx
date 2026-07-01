"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function DeleteButton({
  endpoint,
  id,
  title,
  description,
}: {
  endpoint: string;
  id: string;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function remove() {
    const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) alert(data.error ?? "ลบไม่สำเร็จ");
    router.refresh();
  }

  return (
    <>
      <Button size="icon-sm" variant="danger" onClick={() => setOpen(true)} aria-label="ลบ">
        <Trash2 className="size-4" />
      </Button>
      {open && (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title={title}
          description={description}
          onConfirm={remove}
        />
      )}
    </>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
  return (
    <DeleteButton
      endpoint="/api/admin/categories"
      id={id}
      title="ยืนยันการลบหมวดหมู่"
      description="คุณต้องการลบหมวดหมู่นี้ถาวรหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
    />
  );
}

export function DeleteProductButton({ id }: { id: string }) {
  return (
    <DeleteButton
      endpoint="/api/admin/products"
      id={id}
      title="ยืนยันการลบสินค้า"
      description="คุณต้องการลบสินค้านี้ถาวรหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
    />
  );
}

export function DeleteCodeButton({ id }: { id: string }) {
  return (
    <DeleteButton
      endpoint="/api/admin/codes"
      id={id}
      title="ยืนยันการลบโค้ด"
      description="คุณต้องการลบโค้ดนี้ถาวรหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
    />
  );
}
