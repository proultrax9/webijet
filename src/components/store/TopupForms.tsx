"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gift,
  QrCode,
  Landmark,
  Ticket,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatBaht, formatThaiDate } from "@/lib/utils";
import { TOPUP_METHOD_LABEL, TOPUP_STATUS_LABEL } from "@/lib/constants";

export interface TopupPaymentConfig {
  promptpayNumber: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  enablePromptpay: boolean;
  enableSlipUpload: boolean;
  enableAngpao: boolean;
}

export interface TopupHistoryRow {
  id: string;
  method: string;
  amount: number;
  status: string;
  createdAt: string; // ISO
}

type Feedback = { ok: boolean; message: string } | null;

const ANGPAO_RE = /gift\.truemoney\.com\/campaign\/\?v=[A-Za-z0-9]+/;

export function TopupForms({
  payment,
  balance,
  history,
}: {
  payment: TopupPaymentConfig;
  balance: number;
  history: TopupHistoryRow[];
}) {
  const router = useRouter();

  // เลือก tab เริ่มต้นจากวิธีที่เปิดใช้
  const firstTab = payment.enableAngpao
    ? "angpao"
    : payment.enablePromptpay
      ? "promptpay"
      : payment.enableSlipUpload
        ? "slip"
        : "code";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-card p-4 shadow-soft">
          <div>
            <p className="text-sm text-muted-foreground">ยอดเงินคงเหลือ</p>
            <p className="text-2xl font-extrabold text-primary">{formatBaht(balance)}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-primary-gradient text-white shadow-kawaii">
            💰
          </span>
        </div>

        <Tabs defaultValue={firstTab}>
          <TabsList className="w-full">
            {payment.enableAngpao && (
              <TabsTrigger value="angpao">
                <Gift className="size-4" /> อั่งเปา
              </TabsTrigger>
            )}
            {payment.enablePromptpay && (
              <TabsTrigger value="promptpay">
                <QrCode className="size-4" /> PromptPay
              </TabsTrigger>
            )}
            {payment.enableSlipUpload && (
              <TabsTrigger value="slip">
                <Landmark className="size-4" /> โอน + สลิป
              </TabsTrigger>
            )}
            <TabsTrigger value="code">
              <Ticket className="size-4" /> โค้ดเติมเงิน
            </TabsTrigger>
          </TabsList>

          {payment.enableAngpao && (
            <TabsContent value="angpao" className="pt-4">
              <AngpaoForm onDone={() => router.refresh()} />
            </TabsContent>
          )}
          {payment.enablePromptpay && (
            <TabsContent value="promptpay" className="pt-4">
              <PromptPayPanel number={payment.promptpayNumber} />
            </TabsContent>
          )}
          {payment.enableSlipUpload && (
            <TabsContent value="slip" className="pt-4">
              <SlipForm payment={payment} onDone={() => router.refresh()} />
            </TabsContent>
          )}
          <TabsContent value="code" className="pt-4">
            <CodeForm onDone={() => router.refresh()} />
          </TabsContent>
        </Tabs>
      </div>

      {/* ประวัติการเติมเงิน */}
      <div className="rounded-2xl border border-white/70 bg-card p-4 shadow-soft">
        <h3 className="mb-3 font-bold text-foreground">ประวัติการเติมเงินล่าสุด</h3>
        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีประวัติการเติมเงิน</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ช่องทาง</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    <span className="text-xs font-medium">
                      {TOPUP_METHOD_LABEL[h.method as keyof typeof TOPUP_METHOD_LABEL] ?? h.method}
                    </span>
                    <br />
                    <span className="text-[11px] text-muted-foreground">
                      {formatThaiDate(h.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-success">{formatBaht(h.amount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        h.status === "SUCCESS"
                          ? "successSoft"
                          : h.status === "FAILED"
                            ? "dangerSoft"
                            : "muted"
                      }
                    >
                      {TOPUP_STATUS_LABEL[h.status as keyof typeof TOPUP_STATUS_LABEL] ?? h.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

/* ---------- Feedback banner ---------- */
function FeedbackBanner({ fb }: { fb: Feedback }) {
  if (!fb) return null;
  return (
    <div
      className={
        "flex items-start gap-2 rounded-xl p-3 text-sm font-medium " +
        (fb.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger")
      }
    >
      {fb.ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{fb.message}</span>
    </div>
  );
}

/* ---------- อั่งเปา ---------- */
function AngpaoForm({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<Feedback>(null);

  async function submit() {
    setFb(null);
    const v = value.trim();
    if (!ANGPAO_RE.test(v) && !/^[A-Za-z0-9]{18,}$/.test(v)) {
      setFb({
        ok: false,
        message: "รูปแบบลิงก์อั่งเปาไม่ถูกต้อง (ตัวอย่าง: https://gift.truemoney.com/campaign/?v=...)",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/topup/angpao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherUrl: v }),
      });
      const data = await res.json();
      setFb({ ok: !!data.ok, message: data.message ?? (data.ok ? "สำเร็จ" : "ไม่สำเร็จ") });
      if (data.ok) {
        setValue("");
        onDone();
      }
    } catch {
      setFb({ ok: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Gift className="size-5 text-primary" />
        <h3 className="font-bold">เติมเงินด้วยอั่งเปา TrueMoney</h3>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="angpao">ลิงก์อั่งเปา หรือ รหัส voucher</Label>
        <Input
          id="angpao"
          placeholder="https://gift.truemoney.com/campaign/?v=..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <FeedbackBanner fb={fb} />
      <Button className="w-full" onClick={submit} disabled={loading || !value.trim()}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> กำลังเติมเงิน...
          </>
        ) : (
          "เติมเงิน"
        )}
      </Button>
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        ระบบจะขึ้นเงินอั่งเปาเข้ากระเป๋าเงินของคุณโดยอัตโนมัติทันที
      </p>
    </div>
  );
}

/* ---------- PromptPay ---------- */
function PromptPayPanel({ number }: { number: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <QrCode className="size-5 text-primary" />
        <h3 className="font-bold">สแกนจ่ายผ่าน PromptPay</h3>
      </div>

      {/* QR ตกแต่ง */}
      <div className="mx-auto w-fit rounded-2xl border-2 border-primary/20 bg-white p-3 shadow-soft">
        <DecorativeQr />
      </div>

      <div className="rounded-xl bg-accent/50 p-3 text-center">
        <p className="text-xs text-muted-foreground">พร้อมเพย์</p>
        <p className="text-lg font-extrabold tracking-wide text-primary">{number}</p>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        กรุณาโอนตามยอดที่มี <b className="mx-1 text-foreground">ทศนิยมไม่ซ้ำ</b> (เช่น 100.02 บาท)
        เพื่อให้ระบบตรวจสอบสลิปได้อัตโนมัติ
      </p>
    </div>
  );
}

function DecorativeQr() {
  // สร้างลาย QR แบบ deterministic เพื่อการตกแต่ง (ไม่ใช่ QR จริง)
  const size = 21;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    const r = Math.floor(i / size);
    const c = i % size;
    const finder =
      (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
    cells.push(finder ? (r % 6 < 4 && c % 6 < 4) : ((r * 13 + c * 7) % 3 === 0));
  }
  return (
    <div
      className="grid gap-0"
      style={{ gridTemplateColumns: `repeat(${size}, 8px)` }}
      aria-hidden
    >
      {cells.map((on, i) => (
        <span
          key={i}
          className={on ? "bg-foreground" : "bg-transparent"}
          style={{ width: 8, height: 8 }}
        />
      ))}
    </div>
  );
}

/* ---------- โอนธนาคาร + สลิป ---------- */
function SlipForm({
  payment,
  onDone,
}: {
  payment: TopupPaymentConfig;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<Feedback>(null);

  function fileToBase64(f: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // ตัด prefix "data:image/...;base64," ออก เหลือเฉพาะ base64
        resolve(result.split(",")[1] ?? "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  async function submit() {
    setFb(null);
    if (!file) {
      setFb({ ok: false, message: "กรุณาเลือกไฟล์สลิปก่อน" });
      return;
    }
    setLoading(true);
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch("/api/topup/slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          contentType: file.type,
        }),
      });
      const data = await res.json();
      setFb({ ok: !!data.ok, message: data.message ?? (data.ok ? "สำเร็จ" : "ไม่สำเร็จ") });
      if (data.ok) onDone();
    } catch {
      setFb({ ok: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Landmark className="size-5 text-primary" />
        <h3 className="font-bold">โอนธนาคาร + อัปโหลดสลิป</h3>
      </div>

      <div className="space-y-1.5 rounded-xl bg-accent/50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">ธนาคาร</span>
          <span className="font-semibold">{payment.bankName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ชื่อบัญชี</span>
          <span className="font-semibold">{payment.bankAccountName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">เลขบัญชี</span>
          <span className="inline-flex items-center gap-1 font-bold text-primary">
            {payment.bankAccountNumber}
            <button
              onClick={() => navigator.clipboard?.writeText(payment.bankAccountNumber)}
              className="rounded p-0.5 hover:bg-primary/10"
              aria-label="คัดลอกเลขบัญชี"
            >
              <Copy className="size-3.5" />
            </button>
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slip-file">ไฟล์สลิป (รูปภาพ)</Label>
        <Input
          id="slip-file"
          type="file"
          accept="image/png,image/jpeg"
          className="pt-2.5 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-primary"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          ระบบจะอ่านยอดเงินจากสลิปอัตโนมัติ (ตรวจสอบผ่าน RDCW) แล้วเติมเข้ากระเป๋าทันที
        </p>
      </div>

      <FeedbackBanner fb={fb} />
      <Button className="w-full" onClick={submit} disabled={loading || !file}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> กำลังตรวจสอบสลิป...
          </>
        ) : (
          "อัปโหลดสลิป"
        )}
      </Button>
    </div>
  );
}

/* ---------- โค้ดเติมเงิน ---------- */
function CodeForm({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<Feedback>(null);

  async function submit() {
    setFb(null);
    if (!code.trim()) {
      setFb({ ok: false, message: "กรุณากรอกโค้ดเติมเงิน" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/topup/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      setFb({ ok: !!data.ok, message: data.message ?? (data.ok ? "สำเร็จ" : "ไม่สำเร็จ") });
      if (data.ok) {
        setCode("");
        onDone();
      }
    } catch {
      setFb({ ok: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/70 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Ticket className="size-5 text-primary" />
        <h3 className="font-bold">แลกโค้ดเติมเงิน</h3>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="code">รหัสโค้ด</Label>
        <Input
          id="code"
          placeholder="กรอกโค้ด เช่น OHAYO100"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </div>
      <FeedbackBanner fb={fb} />
      <Button className="w-full" onClick={submit} disabled={loading || !code.trim()}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> กำลังตรวจสอบ...
          </>
        ) : (
          "แลกโค้ด"
        )}
      </Button>
    </div>
  );
}
