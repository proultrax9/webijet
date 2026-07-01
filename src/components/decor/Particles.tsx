import type { SiteSettingsData } from "@/lib/settings";

type ParticleMode = SiteSettingsData["theme"]["particle"];

const SHAPES = {
  heart: (
    <path d="M12 21s-7-4.35-9.5-8.5C.5 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5.5 3.5 3.5 7C19 16.65 12 21 12 21z" />
  ),
  star: (
    <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
  ),
  sparkle: (
    <path d="M12 2c.5 4.5 3 7 7.5 7.5C15 10 12.5 12.5 12 17c-.5-4.5-3-7-7.5-7.5C9 9 11.5 6.5 12 2z" />
  ),
  bow: (
    <path d="M12 3c-2 3-5 4-8 4 1 4 3 7 8 9 5-2 7-5 8-9-3 0-6-1-8-4zm0 10c-1.5 1-3 1.5-4.5 1.5.5 2 1.5 3.5 4.5 5.5 3-2 4-3.5 4.5-5.5C15 14.5 13.5 14 12 13z" />
  ),
};

type Particle = {
  type: keyof typeof SHAPES;
  left: string;
  top: string;
  size: number;
  color: string;
  delay: string;
  anim: string;
  opacity: number;
};

const BASE: Omit<Particle, "type">[] = [
  { left: "3%", top: "10%", size: 34, color: "#FF8FC4", delay: "0s", anim: "animate-float", opacity: 0.85 },
  { left: "9%", top: "36%", size: 28, color: "#FFD070", delay: "0.8s", anim: "animate-float-slow", opacity: 0.8 },
  { left: "15%", top: "70%", size: 26, color: "#B99CFF", delay: "1.2s", anim: "animate-float", opacity: 0.78 },
  { left: "22%", top: "18%", size: 22, color: "#7EC8FF", delay: "0.4s", anim: "animate-float-slow", opacity: 0.75 },
  { left: "32%", top: "82%", size: 30, color: "#FF9FD0", delay: "1.6s", anim: "animate-float", opacity: 0.8 },
  { left: "44%", top: "8%", size: 24, color: "#FFE08A", delay: "0.2s", anim: "animate-float-slow", opacity: 0.72 },
  { left: "55%", top: "76%", size: 28, color: "#C9B6FF", delay: "1.0s", anim: "animate-float", opacity: 0.78 },
  { left: "66%", top: "22%", size: 32, color: "#FF8FC4", delay: "0.6s", anim: "animate-float-slow", opacity: 0.82 },
  { left: "76%", top: "58%", size: 30, color: "#7EC8FF", delay: "1.4s", anim: "animate-float", opacity: 0.8 },
  { left: "84%", top: "14%", size: 26, color: "#FFD070", delay: "0.9s", anim: "animate-float-slow", opacity: 0.76 },
  { left: "91%", top: "42%", size: 34, color: "#FF9FD0", delay: "0.3s", anim: "animate-float", opacity: 0.85 },
  { left: "87%", top: "80%", size: 24, color: "#B99CFF", delay: "1.8s", anim: "animate-float-slow", opacity: 0.74 },
  { left: "48%", top: "45%", size: 20, color: "#FF6FB3", delay: "2.1s", anim: "animate-float", opacity: 0.65 },
  { left: "12%", top: "52%", size: 18, color: "#6CB8FF", delay: "1.5s", anim: "animate-float-slow", opacity: 0.68 },
];

function shapeForMode(mode: ParticleMode, index: number): keyof typeof SHAPES {
  if (mode === "HEARTS") return "heart";
  if (mode === "STARS") return index % 2 === 0 ? "star" : "sparkle";
  if (mode === "HELLOKITTY") return index % 3 === 0 ? "bow" : index % 2 === 0 ? "heart" : "star";
  return "heart";
}

export function Particles({
  mode = "HELLOKITTY",
  intensity = 1,
}: {
  mode?: ParticleMode;
  intensity?: number;
}) {
  if (mode === "NONE") return null;

  const scale = Math.max(0.35, Math.min(1.5, intensity));

  const particles: Particle[] = BASE.map((p, i) => ({
    ...p,
    type: shapeForMode(mode, i),
    size: Math.round(p.size * (0.75 + scale * 0.45)),
    opacity: Math.min(1, p.opacity * (0.55 + scale * 0.65)),
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={p.size}
          height={p.size}
          className={`absolute ${p.anim}`}
          style={{
            left: p.left,
            top: p.top,
            color: p.color,
            opacity: p.opacity,
            animationDelay: p.delay,
            filter: "drop-shadow(0 2px 8px rgba(255,100,180,0.45))",
          }}
          fill="currentColor"
        >
          {SHAPES[p.type]}
        </svg>
      ))}
    </div>
  );
}
