// lib/truemoney-angpao.ts — โหมดจำลอง (mock)
// อ้างอิง PROJECT-SPEC Section 10
// การใช้งานจริง: ติดตั้ง 'tmn-voucher' แล้วเปลี่ยน MOCK_INTEGRATIONS=false

export type AngpaoResult =
  | { ok: true; amount: number; reference: string; message: string }
  | { ok: false; code: AngpaoErrorCode; message: string };

export type AngpaoErrorCode =
  | "INVALID"
  | "EXPIRED"
  | "ALREADY_REDEEMED"
  | "AMOUNT_MISMATCH"
  | "RATE_LIMIT";

const ANGPAO_URL_RE =
  /^https:\/\/gift\.truemoney\.com\/campaign\/\?v=([A-Za-z0-9]+)/;

export function parseVoucher(input: string): string | null {
  const trimmed = input.trim();
  const m = trimmed.match(ANGPAO_URL_RE);
  if (m) return m[1];
  // รองรับกรอกเฉพาะรหัส voucher (a-z0-9 ยาว >= 18)
  if (/^[A-Za-z0-9]{18,}$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * redeemAngpao — จำลองการขึ้นเงินอั่งเปา TrueMoney (server-side เท่านั้น)
 * @param merchantPhone เบอร์ TrueMoney ร้าน (จาก env — ห้าม expose)
 * @param voucherUrl ลิงก์อั่งเปา หรือรหัส voucher
 */
export async function redeemAngpao(
  merchantPhone: string,
  voucherUrl: string,
): Promise<AngpaoResult> {
  // 1) Validate URL / voucher format
  const voucher = parseVoucher(voucherUrl);
  if (!voucher) {
    return {
      ok: false,
      code: "INVALID",
      message: "ลิงก์อั่งเปาไม่ถูกต้อง กรุณาตรวจสอบรูปแบบลิงก์ (https://gift.truemoney.com/campaign/?v=...)",
    };
  }

  const isMock = process.env.MOCK_INTEGRATIONS !== "false";
  if (!isMock) {
    // TODO: การใช้งานจริง
    // const { redeemvouchers } = await import("tmn-voucher");
    // const result = await redeemvouchers(merchantPhone, voucherUrl);
    // return map(result)
    throw new Error("โหมด API จริงยังไม่เปิดใช้งาน — ตั้ง MOCK_INTEGRATIONS=true");
  }

  // ===== โหมดจำลอง =====
  await sleep(700); // จำลอง latency

  // จำลอง error จากรหัสพิเศษ เพื่อทดสอบ UI
  const lower = voucher.toLowerCase();
  if (lower.includes("expired")) {
    return { ok: false, code: "EXPIRED", message: "อั่งเปาหมดอายุแล้ว" };
  }
  if (lower.includes("used") || lower.includes("redeem")) {
    return { ok: false, code: "ALREADY_REDEEMED", message: "อั่งเปานี้ถูกใช้ไปแล้ว" };
  }

  // จำลองจำนวนเงินจาก hash ของ voucher (5–500 บาท)
  const amount = mockAmountFromVoucher(voucher);
  return {
    ok: true,
    amount,
    reference: `angpao_${voucher.slice(0, 12)}`,
    message: `เติมเงินสำเร็จ +${amount.toLocaleString("th-TH")} บาท`,
  };
}

function mockAmountFromVoucher(voucher: string): number {
  let hash = 0;
  for (let i = 0; i < voucher.length; i++) {
    hash = (hash * 31 + voucher.charCodeAt(i)) >>> 0;
  }
  const options = [5, 10, 20, 50, 100, 150, 200, 300, 500];
  return options[hash % options.length];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
