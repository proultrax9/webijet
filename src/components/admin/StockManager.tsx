"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Plus,
  Upload,
  RefreshCw,
  Trash2,
  Download,
  Search,
  Check,
  Undo2,
  Pencil,
  Copy,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type StockRow = {
  id: string;
  content: string;
  isSold: boolean;
  soldAt: string | null;
  createdAt: string;
  buyer: string | null;
};

type FilterTab = "available" | "sold" | "all";

const PAGE_SIZE = 10;

function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function downloadText(filename: string, lines: string[]) {
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StockManagerDialog({
  open,
  setOpen,
  productId,
  productName,
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<FilterTab>("available");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [addText, setAddText] = useState("");
  const [editRow, setEditRow] = useState<StockRow | null>(null);
  const [editText, setEditText] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    payload: Record<string, unknown>;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stock?productId=${productId}`);
      const data = await res.json();
      if (data.ok) setItems(data.items);
      else alert(data.error ?? "โหลดข้อมูลไม่สำเร็จ");
    } catch {
      alert("เชื่อมต่อไม่สำเร็จ");
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(payload: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...payload }),
      });
      const data = await res.json();
      if (!data.ok) alert(data.error ?? "ดำเนินการไม่สำเร็จ");
      await load();
      router.refresh(); // อัปเดตตัวเลข stock ในตารางสินค้า
    } catch {
      alert("เชื่อมต่อไม่สำเร็จ");
    }
    setBusy(false);
  }

  const available = items.filter((i) => !i.isSold);
  const sold = items.filter((i) => i.isSold);

  const filtered = useMemo(() => {
    const base = tab === "available" ? available : tab === "sold" ? sold : items;
    const q = query.trim().toLowerCase();
    return q ? base.filter((i) => i.content.toLowerCase().includes(q)) : base;
  }, [tab, query, items, available, sold]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const tabLabel = tab === "available" ? "ยังไม่ขาย" : tab === "sold" ? "ขายแล้ว" : "ทั้งหมด";

  return (
    <Dialog open={open} onOpenChange={setOpen} className="max-w-5xl">
      <DialogContent onClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>จัดการสต็อค: {productName}</DialogTitle>
        </DialogHeader>

        {/* แถบปุ่มคำสั่ง */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)} disabled={busy}>
            <Plus className="size-4" />
            เพิ่มสต็อค
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} disabled={busy}>
            <Upload className="size-4" />
            เพิ่มหลายรายการ
          </Button>
          <Button size="sm" variant="outline" onClick={load} disabled={busy || loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
          <Button
            size="sm"
            variant="outline"
            title="ปรับตัวเลขสต็อคหน้าเว็บให้ตรงกับจำนวนชิ้นที่พร้อมขายจริง"
            onClick={() => run({ action: "sync" })}
            disabled={busy}
          >
            <RefreshCw className="size-4" />
            รีเฟรชสต็อค
          </Button>
          <Button
            size="sm"
            variant="danger"
            title="ลบสต็อกที่ยังไม่ขายทั้งหมด"
            onClick={() =>
              setConfirmAction({
                title: "ยืนยันการล้างสต็อก",
                description: `คุณต้องการลบสต็อกที่ยังไม่ขายทั้งหมด ${available.length} ชิ้นถาวรหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
                payload: { action: "clear" },
              })
            }
            disabled={busy || available.length === 0}
          >
            <Trash2 className="size-4" />
            ล้างสต็อก
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadText(
                `stock-available-${productName}.txt`,
                available.map((i) => i.content),
              )
            }
            disabled={available.length === 0}
          >
            <Download className="size-4" />
            ดาวน์โหลดสต็อค (ยังไม่ขาย)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadText(
                `stock-sold-${productName}.txt`,
                sold.map((i) => i.content),
              )
            }
            disabled={sold.length === 0}
          >
            <Download className="size-4" />
            ดาวน์โหลดสต็อค (ขายแล้ว)
          </Button>
        </div>

        {/* การ์ดสรุป */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">รวมทั้งหมด</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">คงเหลือ</p>
            <p className="text-2xl font-bold text-success">{available.length}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">ขายแล้ว</p>
            <p className="text-2xl font-bold text-danger">{sold.length}</p>
          </div>
        </div>

        {/* แท็บ + ค้นหา */}
        <div className="mb-3 flex flex-wrap gap-2">
          {(
            [
              ["available", `ยังไม่ขาย (${available.length})`],
              ["sold", `ขายแล้ว (${sold.length})`],
              ["all", `ทั้งหมด (${items.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                tab === key
                  ? "bg-primary text-primary-foreground shadow-kawaii"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาสต็อคสินค้า..."
            className="pl-9"
          />
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          พบ {filtered.length} รายการ (จาก{tabLabel})
        </p>

        {/* ตาราง */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">สต็อคสินค้า</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">วันที่เพิ่ม</th>
                <th className="px-4 py-3">ผู้ซื้อ</th>
                <th className="px-4 py-3">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-6 animate-spin" />
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    ไม่มีรายการ
                  </td>
                </tr>
              ) : (
                pageItems.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="max-w-xs px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 truncate font-mono" title={row.content}>
                          {row.content}
                        </span>
                        <button
                          onClick={() => navigator.clipboard?.writeText(row.content)}
                          className="shrink-0 rounded-lg p-1.5 text-primary hover:bg-primary/10"
                          title="คัดลอก"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.isSold ? (
                        <Badge variant="dangerSoft">ขายแล้ว</Badge>
                      ) : (
                        <Badge variant="successSoft">พร้อมขาย</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatThaiDate(row.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.buyer ?? <span className="text-muted-foreground/50">-</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-1">
                        {row.isSold ? (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            title="เอากลับมาขายใหม่"
                            onClick={() => run({ action: "markAvailable", id: row.id })}
                            disabled={busy}
                          >
                            <Undo2 className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            title="ทำเครื่องหมายว่าขายแล้ว"
                            onClick={() => run({ action: "markSold", id: row.id })}
                            disabled={busy}
                          >
                            <Check className="size-4" />
                          </Button>
                        )}
                        <Button
                          size="icon-sm"
                          variant="outline"
                          title="แก้ไข"
                          onClick={() => {
                            setEditRow(row);
                            setEditText(row.content);
                          }}
                          disabled={busy}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="danger"
                          title="ลบ"
                          onClick={() =>
                            setConfirmAction({
                              title: "ยืนยันการลบสต็อก",
                              description:
                                "คุณต้องการลบสต็อกชิ้นนี้ถาวรหรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
                              payload: { action: "delete", id: row.id },
                            })
                          }
                          disabled={busy}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* แบ่งหน้า */}
        {filtered.length > PAGE_SIZE && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              แสดง {(safePage - 1) * PAGE_SIZE + 1}-
              {Math.min(safePage * PAGE_SIZE, filtered.length)} จากทั้งหมด {filtered.length} รายการ
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                ก่อนหน้า
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`size-8 rounded-lg text-sm transition-colors ${
                    n === safePage
                      ? "bg-primary text-primary-foreground"
                      : "border text-foreground hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}

        {/* Dialog เพิ่มสต็อก (รองรับหลายบรรทัด) */}
        <Dialog open={addOpen} onOpenChange={setAddOpen} className="max-w-2xl">
          <DialogContent onClose={() => setAddOpen(false)}>
            <DialogHeader>
              <DialogTitle>เพิ่มสต็อค</DialogTitle>
            </DialogHeader>
            <div>
              <Label>ข้อมูลสต็อก (1 บรรทัด = 1 ชิ้น เช่น user:pass หรือ license key)</Label>
              <Textarea
                rows={8}
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                placeholder={"user1:pass1\nuser2:pass2\nKEY-XXXX-YYYY"}
                className="font-mono text-xs"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                จะเพิ่ม {addText.split("\n").filter((l) => l.trim()).length} ชิ้น
                และตัวเลขสต็อกหน้าเว็บจะอัปเดตอัตโนมัติ
              </p>
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  await run({ action: "add", contents: addText });
                  setAddText("");
                  setAddOpen(false);
                }}
                disabled={busy || !addText.trim()}
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                เพิ่มสต็อค
              </Button>
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                ยกเลิก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Popup ยืนยันลบ/ล้างสต็อก */}
        {confirmAction && (
          <ConfirmDialog
            open={!!confirmAction}
            onOpenChange={(o) => !o && setConfirmAction(null)}
            title={confirmAction.title}
            description={confirmAction.description}
            onConfirm={async () => {
              await run(confirmAction.payload);
              setConfirmAction(null);
            }}
          />
        )}

        {/* Dialog แก้ไขสต็อก */}
        <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
          <DialogContent onClose={() => setEditRow(null)}>
            <DialogHeader>
              <DialogTitle>แก้ไขสต็อค</DialogTitle>
            </DialogHeader>
            <div>
              <Label>ข้อมูลสต็อก</Label>
              <Textarea
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  if (!editRow) return;
                  await run({ action: "edit", id: editRow.id, content: editText });
                  setEditRow(null);
                }}
                disabled={busy || !editText.trim()}
              >
                บันทึก
              </Button>
              <Button variant="outline" onClick={() => setEditRow(null)}>
                <X className="size-4" />
                ยกเลิก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

export function ManageStockButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="จัดการสต็อค"
        title="จัดการสต็อค / รหัสสินค้า"
      >
        <Boxes className="size-4" />
      </Button>
      {open && (
        <StockManagerDialog
          open={open}
          setOpen={setOpen}
          productId={productId}
          productName={productName}
        />
      )}
    </>
  );
}
