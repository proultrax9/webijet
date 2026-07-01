import type { SiteSettingsData } from "./settings";

/** แปลง #RRGGBB เป็น "H S% L%" สำหรับ CSS variable */
export function hexToHslParts(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "332 100% 72%";

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const FONT_MAP: Record<
  SiteSettingsData["font"],
  { label: string; className: string; previewFamily: string }
> = {
  Prompt: {
    label: "Prompt",
    className: "font-prompt",
    previewFamily: "var(--font-prompt), sans-serif",
  },
  "Thai RG": {
    label: "Thai RG (Kanit)",
    className: "font-kanit",
    previewFamily: "var(--font-kanit), sans-serif",
  },
  "SF Pro": {
    label: "SF Pro / System",
    className: "font-sf",
    previewFamily: "-apple-system, BlinkMacSystemFont, system-ui, Segoe UI, sans-serif",
  },
};

export function panelStyleFromLevel(level: number) {
  const lv = Math.max(1, Math.min(10, Math.round(level || 6)));
  const bgAlpha = (0.94 - ((lv - 1) / 9) * 0.76).toFixed(2);
  const borderAlpha = (0.78 - ((lv - 1) / 9) * 0.38).toFixed(2);
  const blur = (6 + lv * 1.4).toFixed(1);
  return { level: lv, bgAlpha, borderAlpha, blur };
}

export function buildThemeCss(settings: SiteSettingsData): string {
  const { theme, branding } = settings;
  const primary = hexToHslParts(theme.primary);
  const secondary = hexToHslParts(theme.secondary);
  const background = hexToHslParts(theme.background);
  const text = hexToHslParts(theme.text);

  // ความเข้มพื้นหลัง pastel + particle (จาก Settings → ธีมสี → Opacity)
  const intensity = Math.max(0.15, Math.min(1, theme.opacity ?? 1));
  const pinkGlow = (0.45 + intensity * 0.45).toFixed(2);
  const blueGlow = (0.42 + intensity * 0.45).toFixed(2);
  const purpleGlow = (0.4 + intensity * 0.42).toFixed(2);
  const mintGlow = (0.32 + intensity * 0.38).toFixed(2);
  const dotAlpha = (0.14 + intensity * 0.18).toFixed(2);
  const panel = panelStyleFromLevel(branding.panelTransparency ?? 6);

  // ความชัดของรูปพื้นหลัง: 1 = เห็นรูปเต็ม, 0 = ซ่อนรูป (เห็นเฉพาะสีพื้น) — clamp กันค่าเกิน
  const bgVisibility = Math.max(0, Math.min(1, Number(branding.backgroundOpacity) || 0));
  const overlayAlpha = (1 - bgVisibility).toFixed(2);

  const bgImageRules = branding.backgroundUrl?.trim()
    ? `
      background-image: linear-gradient(hsla(var(--background) / ${overlayAlpha}), hsla(var(--background) / ${overlayAlpha})), url("${branding.backgroundUrl}");
      background-size: cover;
      background-position: center;
      background-attachment: fixed;`
    : `
      background-image:
        radial-gradient(circle at 8% 10%, rgba(255, 173, 214, ${pinkGlow}), transparent 42%),
        radial-gradient(circle at 92% 8%, rgba(168, 206, 255, ${blueGlow}), transparent 44%),
        radial-gradient(circle at 78% 92%, rgba(212, 178, 255, ${purpleGlow}), transparent 46%),
        radial-gradient(circle at 18% 88%, rgba(178, 240, 220, ${mintGlow}), transparent 44%),
        radial-gradient(rgba(255, 130, 190, ${dotAlpha}) 1.6px, transparent 1.6px);
      background-size: auto, auto, auto, auto, 20px 20px;
      background-attachment: fixed;`;

  return `
    :root {
      --primary: ${primary};
      --secondary: ${secondary};
      --background: ${background};
      --foreground: ${text};
      --ring: ${primary};
      --particle-intensity: ${intensity};
      --panel-bg-alpha: ${panel.bgAlpha};
      --panel-border-alpha: ${panel.borderAlpha};
      --panel-blur: ${panel.blur}px;
    }
    .site-theme-root {
      background-color: hsl(var(--background));
      ${bgImageRules}
    }
    .bg-primary-gradient {
      background: linear-gradient(135deg, color-mix(in srgb, ${theme.primary} 75%, white) 0%, ${theme.primary} 100%) !important;
    }
  `;
}

export function getSiteBaseUrl(propertyUrl?: string): string {
  const fromGsc = propertyUrl?.trim();
  if (fromGsc) return fromGsc.replace(/\/$/, "");
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
