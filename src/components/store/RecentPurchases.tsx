"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatBaht, maskName, timeAgo } from "@/lib/utils";

export interface RecentPurchaseItem {
  id: string;
  productName: string;
  productImage?: string | null;
  buyerName: string;
  price: number;
  createdAt: string;
}

const SCROLL_SPEED = 55; // px/s
const POLL_MS = 8000;
const HIGHLIGHT_MS = 2000;
const RETURN_MS = 550;

function PurchaseCard({
  item,
  highlight,
}: {
  item: RecentPurchaseItem;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-64 shrink-0 items-center gap-3 rounded-2xl border bg-white p-3 shadow-soft transition-all duration-300",
        highlight
          ? "scale-[1.03] border-primary/60 ring-2 ring-primary/50 shadow-kawaii"
          : "border-white/70",
      )}
    >
      <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-accent to-secondary/20">
        <img
          src={item.productImage ?? "/assets/mascot.svg"}
          alt={item.productName}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-sm font-bold text-foreground">
            {maskName(item.buyerName)}
          </span>
          <span className="shrink-0 text-sm font-extrabold text-danger">
            {formatBaht(item.price)}
          </span>
        </div>
        <p className="truncate text-xs font-medium text-foreground/70">{item.productName}</p>
        <div className="mt-1 flex items-center justify-between gap-1">
          <span className="truncate text-[11px] text-foreground/50">
            {timeAgo(item.createdAt)}
          </span>
          <Badge variant={highlight ? "pink" : "successSoft"} className="shrink-0">
            {highlight ? "ใหม่!" : "ซื้อแล้ว"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function RecentPurchases({ items: initialItems }: { items: RecentPurchaseItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const rafId = useRef<number>();
  const lastTime = useRef(0);
  const pos = useRef(0); // ระยะเลื่อน (px) — บวก = เลื่อนไปทางซ้าย
  const lastLatestId = useRef(initialItems[0]?.id ?? "");
  const pendingNewId = useRef<string | null>(null);
  const returnAnim = useRef<{ from: number; start: number } | null>(null);
  const highlightUntil = useRef(0);
  const hoverPaused = useRef(false);

  const applyTransform = () => {
    if (track.current) {
      track.current.style.transform = `translate3d(${-pos.current}px, 0, 0)`;
    }
  };

  const beginShowNew = useCallback((newId: string) => {
    returnAnim.current = { from: pos.current, start: performance.now() };
    setHighlightId(null);
    window.setTimeout(() => {
      setHighlightId(newId);
      highlightUntil.current = performance.now() + HIGHLIGHT_MS;
    }, RETURN_MS);
  }, []);

  // หลัง DOM อัปเดตรายการใหม่ → เลื่อนกลับมาโชว์ออเดอร์ล่าสุด
  useLayoutEffect(() => {
    const newId = pendingNewId.current;
    if (!newId) return;
    pendingNewId.current = null;
    beginShowNew(newId);
  }, [items, beginShowNew]);

  // ดึงออเดอร์ใหม่ทุก 8 วินาที
  useEffect(() => {
    if (initialItems.length === 0) return;

    const poll = async () => {
      try {
        const res = await fetch("/api/recent-purchases", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { items: RecentPurchaseItem[] };
        if (!data.items?.length) return;

        const freshLatest = data.items[0]?.id;
        if (freshLatest && freshLatest !== lastLatestId.current) {
          if (lastLatestId.current) pendingNewId.current = freshLatest;
          lastLatestId.current = freshLatest;
        }
        setItems(data.items);
      } catch {
        /* ignore */
      }
    };

    const timer = window.setInterval(poll, POLL_MS);
    return () => window.clearInterval(timer);
  }, [initialItems.length]);

  // เลื่อนไป–กลับตลอดเวลา (ทำงานเสมอ ไม่ปิดตาม reduced-motion เพราะเป็นฟีเจอร์ที่ตั้งใจให้เลื่อน)
  useEffect(() => {
    if (!viewport.current || !track.current || items.length === 0) return;

    lastTime.current = 0;

    const tick = (time: number) => {
      const vp = viewport.current;
      const tr = track.current;
      if (!vp || !tr) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }

      const maxShift = Math.max(0, tr.scrollWidth - vp.clientWidth);

      if (returnAnim.current) {
        const { from, start } = returnAnim.current;
        const progress = Math.min(1, (time - start) / RETURN_MS);
        pos.current = from * (1 - easeOutCubic(progress));
        applyTransform();
        if (progress >= 1) {
          pos.current = 0;
          returnAnim.current = null;
          direction.current = 1;
          applyTransform();
        }
        rafId.current = requestAnimationFrame(tick);
        return;
      }

      const inHighlight = time < highlightUntil.current;
      const blocked = hoverPaused.current || inHighlight || maxShift <= 4;

      if (!blocked) {
        if (!lastTime.current) lastTime.current = time;
        const delta = Math.min(0.05, (time - lastTime.current) / 1000);
        lastTime.current = time;

        pos.current += direction.current * SCROLL_SPEED * delta;

        if (pos.current >= maxShift) {
          pos.current = maxShift;
          direction.current = -1;
        } else if (pos.current <= 0) {
          pos.current = 0;
          direction.current = 1;
        }
        applyTransform();
      } else {
        lastTime.current = time;
      }

      if (highlightUntil.current > 0 && time >= highlightUntil.current) {
        highlightUntil.current = 0;
        setHighlightId(null);
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div
      ref={viewport}
      className="relative overflow-hidden py-2"
      onMouseEnter={() => {
        hoverPaused.current = true;
      }}
      onMouseLeave={() => {
        hoverPaused.current = false;
      }}
    >
      <div ref={track} className="flex w-max gap-3 px-1 will-change-transform">
        {items.map((item) => (
          <PurchaseCard key={item.id} item={item} highlight={highlightId === item.id} />
        ))}
      </div>
    </div>
  );
}
