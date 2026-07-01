"use client";

import { useEffect, useRef } from "react";

export function BackgroundMusic({
  enabled,
  url,
  volume,
}: {
  enabled: boolean;
  url: string;
  volume: number;
}) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = ref.current;
    if (!audio || !enabled || !url) return;
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch(() => {
      /* บrowser อาจบล็อก autoplay จนกว่าผู้ใช้จะ interact */
    });
  }, [enabled, url, volume]);

  if (!enabled || !url) return null;

  return <audio ref={ref} src={url} loop preload="auto" className="hidden" />;
}
