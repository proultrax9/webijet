// lib/rdcw-slip.ts — ตรวจสลิปจริงผ่าน RDCW Slip Verify (https://slip.rdcw.co.th)
// เอกสาร: https://slip.rdcw.co.th/docs  —  POST https://suba.rdcw.co.th/v2/inquiry

const RDCW_ENDPOINT = "https://suba.rdcw.co.th/v2/inquiry";

export type SlipVerifyResult =
  | {
      ok: true;
      amount: number;
      transRef: string;
      receiverAccount: string | null;
      receiverName: string | null;
    }
  | { ok: false; message: string };

// รหัส error จาก RDCW → ข้อความภาษาไทย
const ERROR_MESSAGES: Record<number, string> = {
  1000: "การตั้งค่าระบบตรวจสลิปไม่ถูกต้อง",
  1001: "การยืนยันตัวตน RDCW ไม่ถูกต้อง",
  1002: "การยืนยันตัวตน RDCW ไม่ถูกต้อง",
  1003: "IP เซิร์ฟเวอร์ยังไม่ได้ whitelist กับ RDCW",
  1004: "อ่านสลิปไม่สำเร็จ กรุณาอัปโหลดรูปสลิปที่ชัดเจน",
  1005: "อ่านสลิปไม่สำเร็จ กรุณาอัปโหลดรูปสลิปที่ชัดเจน",
  1006: "อ่านสลิปไม่สำเร็จ กรุณาอัปโหลดรูปสลิปที่ชัดเจน",
  1007: "โควตาตรวจสลิปหมด กรุณาติดต่อผู้ดูแล",
  1008: "แพ็กเกจตรวจสลิปหมดอายุ กรุณาติดต่อผู้ดูแล",
  2006: "ไม่พบข้อมูลสลิปนี้ในระบบธนาคาร",
};

type RdcwData = {
  transRef?: string;
  amount?: number;
  receiver?: {
    displayName?: string;
    name?: string;
    account?: { value?: string };
    proxy?: { value?: string };
  };
};

function isMockMode(): boolean {
  return (
    process.env.MOCK_INTEGRATIONS !== "false" ||
    !process.env.RDCW_CLIENT_ID ||
    !process.env.RDCW_CLIENT_SECRET
  );
}

/** ตรวจสลิปจากรูปภาพ (base64 ของไฟล์รูป) */
export async function verifySlipImage(
  imageBase64: string,
  contentType: string,
): Promise<SlipVerifyResult> {
  // โหมดจำลอง (dev / ยังไม่ใส่ credential) — จำลองผลตรวจ ไม่ยิง API จริง
  if (isMockMode()) {
    return {
      ok: true,
      amount: 100,
      transRef: `MOCK-${Date.now().toString(36).toUpperCase()}`,
      receiverAccount: null,
      receiverName: "MOCK RECEIVER",
    };
  }

  const clientId = process.env.RDCW_CLIENT_ID!;
  const clientSecret = process.env.RDCW_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const buffer = Buffer.from(imageBase64, "base64");

  let json: { valid?: boolean; data?: RdcwData; code?: number; message?: string };
  try {
    const res = await fetch(RDCW_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": contentType === "image/png" ? "image/png" : "image/jpeg",
      },
      body: buffer,
    });
    json = await res.json();
  } catch {
    return { ok: false, message: "เชื่อมต่อระบบตรวจสลิปไม่สำเร็จ กรุณาลองใหม่" };
  }

  if (typeof json.code === "number") {
    return { ok: false, message: ERROR_MESSAGES[json.code] ?? "ตรวจสลิปไม่สำเร็จ" };
  }
  if (!json.valid || !json.data) {
    return { ok: false, message: "สลิปไม่ถูกต้องหรือไม่พบข้อมูล" };
  }

  const d = json.data;
  const amount = Number(d.amount);
  const transRef = d.transRef;
  if (!transRef || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: "ข้อมูลสลิปไม่สมบูรณ์" };
  }

  return {
    ok: true,
    amount,
    transRef,
    receiverAccount: d.receiver?.account?.value ?? d.receiver?.proxy?.value ?? null,
    receiverName: d.receiver?.displayName ?? d.receiver?.name ?? null,
  };
}

/**
 * ตรวจว่าบัญชีผู้รับในสลิปตรงกับบัญชีร้านไหม (best-effort)
 * สลิปมักปิดบังเลขบางส่วน (xxx-x-x1234-x) — เทียบเฉพาะเลขที่มองเห็น
 * คืน true เมื่อยืนยันไม่ได้ (ไม่มีข้อมูล) เพื่อไม่ปฏิเสธสลิปที่ถูกต้องโดยพลาด
 */
export function receiverMatchesShop(
  slipReceiver: string | null,
  shopAccounts: (string | null | undefined)[],
): boolean {
  if (!slipReceiver) return true;
  const visible = slipReceiver.replace(/\D/g, "");
  if (visible.length < 3) return true; // เลขที่เห็นน้อยเกินไป ยืนยันไม่ได้

  const tail = visible.slice(-4);
  const candidates = shopAccounts
    .map((a) => (a ?? "").replace(/\D/g, ""))
    .filter((a) => a.length >= 4);

  if (candidates.length === 0) return true; // ร้านไม่ได้ตั้งบัญชีไว้ ยืนยันไม่ได้
  return candidates.some((acc) => acc.includes(tail));
}
