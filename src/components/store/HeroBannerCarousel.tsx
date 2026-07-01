"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_INTERVAL_MS = 5000;

export function HeroBannerCarousel({
  banners,
  alt,
}: {
  banners: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = banners.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_INTERVAL_MS);
  }, [count]);

  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restartTimer]);

  function manualGo(next: number) {
    go(next);
    restartTimer(); // กดเองแล้วเริ่มนับเวลาออโต้ใหม่ จะได้ไม่เด้งทันที
  }

  if (count === 0) return null;

  return (
    <section className="group relative overflow-hidden rounded-3xl border border-white/70 bg-kawaii-gradient shadow-kawaii">
      {/* แถบสไลด์ */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={i === 0 ? alt : `${alt} (${i + 1})`}
            width={1640}
            height={500}
            className="block aspect-[1640/500] w-full shrink-0 object-fill"
            draggable={false}
          />
        ))}
      </div>

      {count > 1 && (
        <>
          {/* ปุ่มเลื่อนซ้าย/ขวา */}
          <button
            type="button"
            onClick={() => manualGo(index - 1)}
            aria-label="แบนเนอร์ก่อนหน้า"
            className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/80 text-primary shadow-kawaii backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => manualGo(index + 1)}
            aria-label="แบนเนอร์ถัดไป"
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/70 bg-white/80 text-primary shadow-kawaii backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* จุดบอกตำแหน่ง */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => manualGo(i)}
                aria-label={`ไปแบนเนอร์ที่ ${i + 1}`}
                className={`h-2.5 rounded-full border border-white/60 shadow-sm transition-all ${
                  i === index ? "w-6 bg-primary" : "w-2.5 bg-white/80 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
