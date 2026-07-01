// ค่าคงที่แทน enum (SQLite ไม่รองรับ enum) — อ้างอิงทั้งฝั่ง server/client

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "รอดำเนินการ",
  PROCESSING: "กำลังดำเนินการ",
  COMPLETED: "เสร็จสมบูรณ์",
  CANCELED: "ยกเลิก",
};

export const TOPUP_METHOD = {
  ANGPAO: "ANGPAO",
  PROMPTPAY: "PROMPTPAY",
  BANK_SLIP: "BANK_SLIP",
  CODE: "CODE",
} as const;
export type TopupMethod = (typeof TOPUP_METHOD)[keyof typeof TOPUP_METHOD];

export const TOPUP_METHOD_LABEL: Record<TopupMethod, string> = {
  ANGPAO: "TrueMoney อั่งเปา",
  PROMPTPAY: "PromptPay QR",
  BANK_SLIP: "โอนธนาคาร + สลิป",
  CODE: "โค้ดเติมเงิน",
};

export const TOPUP_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;
export type TopupStatus = (typeof TOPUP_STATUS)[keyof typeof TOPUP_STATUS];

export const TOPUP_STATUS_LABEL: Record<TopupStatus, string> = {
  PENDING: "รอตรวจสอบ",
  SUCCESS: "สำเร็จ",
  FAILED: "ล้มเหลว",
};

export const CLAIM_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
} as const;
export type ClaimStatus = (typeof CLAIM_STATUS)[keyof typeof CLAIM_STATUS];

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  PENDING: "รอดำเนินการ",
  IN_PROGRESS: "ดำเนินการ",
  REJECTED: "ปฏิเสธ",
  COMPLETED: "เสร็จสิ้น",
};
