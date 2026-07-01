"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// โลโก้ร้าน: ใช้ไฟล์ SVG จาก settings ถ้ามี (codex เจน) ไม่งั้น fallback เป็น badge inline
export function Logo({ url, className }: { url?: string; className?: string }) {
  const [errored, setErrored] = useState(false);

  if (url && !errored) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt="O-Hayo"
        width={120}
        height={40}
        className={cn("h-10 w-auto max-w-[140px] object-contain", className)}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-2xl bg-primary-gradient px-3 py-1.5 text-lg font-extrabold text-white shadow-kawaii",
        className,
      )}
    >
      O-Hayo
    </span>
  );
}
