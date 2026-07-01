// lib/truemoney-angpao.ts — ขึ้นเงินอั่งเปา TrueMoney
// MOCK_INTEGRATIONS=true  → โหมดจำลอง (ไม่ยิง API จริง)
// MOCK_INTEGRATIONS=false → ยิง API gift.truemoney.com จริง (ต้องตั้ง TRUEMONEY_PHONE)

import https from "node:https";

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
  /gift\.truemoney\.com\/campaign\/?\?v=([A-Za-z0-9]+)/;

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
    return redeemAngpaoReal(merchantPhone, voucher);
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

// ===== โหมดใช้งานจริง — ยิง API gift.truemoney.com =====
async function redeemAngpaoReal(
  merchantPhone: string,
  voucher: string,
): Promise<AngpaoResult> {
  const phone = merchantPhone.replace(/\D/g, "");
  if (!/^0\d{9}$/.test(phone)) {
    return {
      ok: false,
      code: "INVALID",
      message: "ระบบยังไม่ได้ตั้งค่าเบอร์ TrueMoney ร้าน (TRUEMONEY_PHONE)",
    };
  }

  type TmnResponse = {
    status?: { code?: string; message?: string };
    data?: {
      voucher?: { amount_baht?: string };
      my_ticket?: { amount_baht?: string };
    };
  };

  // หมายเหตุ: ต้องยิงผ่าน node:https (HTTP/1.1 + TLS 1.3) เท่านั้น — global fetch ของ Node
  // ใช้ HTTP/2 แล้วโดน Cloudflare ของ TrueMoney บล็อก 403 (คืนหน้า HTML challenge)
  // ลองซ้ำได้สูงสุด 3 ครั้ง กรณีเน็ตช้า/หลุด (อ้างอิงแนวทางจาก tw-redeem)
  let raw: { status: number; body: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      raw = await httpsRedeem(voucher, phone);
      break;
    } catch {
      if (attempt < 2) await sleep(600);
    }
  }
  if (!raw) {
    return {
      ok: false,
      code: "RATE_LIMIT",
      message: "เชื่อมต่อ TrueMoney ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    };
  }

  let body: TmnResponse;
  try {
    body = JSON.parse(raw.body) as TmnResponse;
  } catch {
    return {
      ok: false,
      code: "INVALID",
      message: `TrueMoney ตอบกลับผิดปกติ (HTTP ${raw.status}) กรุณาลองใหม่`,
    };
  }

  const statusCode = body.status?.code ?? "";

  if (statusCode === "SUCCESS") {
    const amount = parseFloat(
      body.data?.my_ticket?.amount_baht ?? body.data?.voucher?.amount_baht ?? "0",
    );
    if (!amount || amount <= 0) {
      return {
        ok: false,
        code: "INVALID",
        message: "ขึ้นเงินสำเร็จแต่อ่านจำนวนเงินไม่ได้ กรุณาติดต่อแอดมิน",
      };
    }
    return {
      ok: true,
      amount,
      reference: `angpao_${voucher}`,
      message: `เติมเงินสำเร็จ +${amount.toLocaleString("th-TH")} บาท`,
    };
  }

  // แปลงรหัส error ของ TrueMoney เป็นข้อความไทย
  const errorMap: Record<string, { code: AngpaoErrorCode; message: string }> = {
    VOUCHER_NOT_FOUND: { code: "INVALID", message: "ไม่พบอั่งเปานี้ กรุณาตรวจสอบลิงก์อีกครั้ง" },
    VOUCHER_OUT_OF_STOCK: { code: "ALREADY_REDEEMED", message: "อั่งเปานี้ถูกใช้ไปแล้ว" },
    VOUCHER_EXPIRED: { code: "EXPIRED", message: "อั่งเปาหมดอายุแล้ว" },
    CANNOT_GET_OWN_VOUCHER: {
      code: "INVALID",
      message: "ไม่สามารถรับอั่งเปาของตัวเองได้ (เบอร์ผู้ส่งตรงกับเบอร์ร้าน)",
    },
    TARGET_USER_NOT_FOUND: {
      code: "INVALID",
      message: "เบอร์ TrueMoney ร้านไม่ถูกต้อง กรุณาติดต่อแอดมิน",
    },
    CONDITION_NOT_MET: {
      code: "INVALID",
      message: "อั่งเปานี้มีเงื่อนไขพิเศษ ไม่สามารถรับได้",
    },
  };

  const mapped = errorMap[statusCode];
  if (mapped) return { ok: false, ...mapped };

  return {
    ok: false,
    code: "INVALID",
    message: body.status?.message
      ? `TrueMoney: ${body.status.message}`
      : `รับอั่งเปาไม่สำเร็จ (${statusCode || `HTTP ${raw.status}`}) กรุณาลองใหม่`,
  };
}

// ยิง redeem ผ่าน node:https (HTTP/1.1) เพื่อเลี่ยง Cloudflare ที่บล็อก HTTP/2 ของ global fetch
function httpsRedeem(
  voucher: string,
  phone: string,
): Promise<{ status: number; body: string }> {
  const payload = JSON.stringify({ mobile: phone, voucher_hash: voucher });
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: "gift.truemoney.com",
        path: `/campaign/vouchers/${voucher}/redeem`,
        method: "POST",
        // บังคับ TLS 1.3 ให้ TLS fingerprint ใกล้เคียงเบราว์เซอร์จริง (ผ่าน Cloudflare ง่ายขึ้น)
        minVersion: "TLSv1.3",
        maxVersion: "TLSv1.3",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": Buffer.byteLength(payload),
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Origin: "https://gift.truemoney.com",
          Referer: `https://gift.truemoney.com/campaign/?v=${voucher}`,
        },
        timeout: 15000,
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
      },
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.write(payload);
    req.end();
  });
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
