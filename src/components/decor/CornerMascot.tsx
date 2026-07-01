// มาสคอต Hello-Kitty style มุมจอ (inline SVG — ไม่ต้องพึ่งไฟล์ภายนอก)
import { cn } from "@/lib/utils";

function KittyFace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      {/* หัว */}
      <ellipse cx="60" cy="55" rx="46" ry="40" fill="#fff" stroke="#FFC2DE" strokeWidth="2" />
      {/* หู */}
      <path d="M24 30 L18 6 L44 26 Z" fill="#fff" stroke="#FFC2DE" strokeWidth="2" />
      <path d="M96 30 L102 6 L76 26 Z" fill="#fff" stroke="#FFC2DE" strokeWidth="2" />
      {/* โบว์ */}
      <circle cx="92" cy="34" r="9" fill="#FF6FB3" />
      <path d="M92 34 L106 26 L106 42 Z" fill="#FF6FB3" />
      <path d="M92 34 L78 26 L78 42 Z" fill="#FF8EC5" />
      <circle cx="92" cy="34" r="3.5" fill="#fff" opacity="0.8" />
      {/* ตา */}
      <ellipse cx="46" cy="56" rx="3.6" ry="6" fill="#3a3a4a" />
      <ellipse cx="74" cy="56" rx="3.6" ry="6" fill="#3a3a4a" />
      {/* จมูก */}
      <ellipse cx="60" cy="66" rx="4.5" ry="3" fill="#FFD24D" />
      {/* หนวด */}
      <g stroke="#E9B8CE" strokeWidth="1.6" strokeLinecap="round">
        <line x1="14" y1="52" x2="34" y2="54" />
        <line x1="12" y1="62" x2="33" y2="62" />
        <line x1="86" y1="54" x2="106" y2="52" />
        <line x1="87" y1="62" x2="108" y2="62" />
      </g>
      {/* แก้มชมพู */}
      <circle cx="34" cy="66" r="5" fill="#FFB6D5" opacity="0.7" />
      <circle cx="86" cy="66" r="5" fill="#FFB6D5" opacity="0.7" />
    </svg>
  );
}

export function CornerMascot({
  position = "bottom-left",
  className,
}: {
  position?: "bottom-left" | "bottom-right";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-0 z-20 w-24 opacity-90 animate-float-slow md:w-32",
        position === "bottom-left" ? "left-2 md:left-4" : "right-2 md:right-4",
        className,
      )}
      aria-hidden
    >
      <KittyFace className="w-full drop-shadow-[0_6px_10px_rgba(255,150,200,0.4)]" />
    </div>
  );
}

export { KittyFace };
