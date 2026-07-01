import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ฟอร์แมตราคาเป็นบาท เช่น ฿1,234 หรือ ฿45.00 */
export function formatBaht(value: number, opts?: { decimals?: boolean }) {
  const decimals = opts?.decimals ?? false;
  return (
    "฿" +
    value.toLocaleString("th-TH", {
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    })
  );
}

/** ช่วงราคา เช่น ฿10 - ฿80 หรือ ฿45 */
export function formatPriceRange(price: number, min?: number | null, max?: number | null) {
  if (min != null && max != null && (min !== price || max !== price)) {
    return `${formatBaht(min)} - ${formatBaht(max)}`;
  }
  return formatBaht(price);
}

/** เลขจำนวนแบบไทย เช่น 1,234 */
export function formatNumber(value: number) {
  return value.toLocaleString("th-TH");
}

/** เวลาแบบ "34 นาทีที่แล้ว" */
export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "เมื่อสักครู่";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

/** mask ชื่อผู้ใช้ เช่น Aekapon -> Ae*** */
export function maskName(name: string) {
  if (!name) return "***";
  return name.slice(0, 2) + "***";
}

/** วันที่ไทยแบบสั้น เช่น 2 ก.ค. 2026 */
export function formatThaiDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** สร้างเลขที่บิล BILL-{timestamp}-{random} */
export function generateBillNumber() {
  const ts = Date.now();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BILL-${ts}-${rand}`;
}
