import { prisma } from "./prisma";

// ===== โครงสร้าง Settings ครบ 15 tabs (PROJECT-SPEC Section 6 + 12) =====
export interface SiteSettingsData {
  // Tab: รายละเอียดเว็บ
  general: {
    ownerPhone: string;
    siteName: string;
    announcement: string;
    featuredTitle: string;
    toggles: {
      reviews: boolean;
      recentPurchases: boolean;
      claims: boolean;
      announcementBar: boolean;
      statusPage: boolean;
      sortFeaturedByPrice: boolean;
      chat: boolean;
      statUsers: boolean;
      statTopup: boolean;
      statStock: boolean;
    };
  };
  // Tab: Meta
  meta: {
    title: string;
    description: string;
    keywords: string;
    photoUrl: string;
  };
  // Tab: Discord
  discord: {
    inviteLink: string;
    webhooks: {
      topup: string;
      purchase: string;
      claim: string;
      preorder: string;
      register: string;
      login: string;
      logout: string;
      stock: string;
    };
  };
  // Tab: Banner
  banners: string[]; // banner 1-3
  // Tab: โลโก้ & พื้นหลัง
  branding: {
    logoUrl: string;
    loadingLogoUrl: string;
    footerLogoUrl: string;
    backgroundUrl: string;
    backgroundOpacity: number;
    /** ความโปร่งใส panel UI — 1 (ทึบ) ถึง 10 (โปร่งใสสุด) */
    panelTransparency: number;
  };
  // Tab: ปุ่มนำทาง
  navButtons: { imageUrl: string; link: string }[]; // 4 ปุ่ม
  // Tab: Ad Banner
  adBanner: {
    imageOrHtml: string;
    dropShadow: number;
    subBanners: string[];
  };
  // Tab: ฟอนต์
  font: "Prompt" | "Thai RG" | "SF Pro";
  // Tab: ธีมสี
  theme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    opacity: number;
    particle: "HELLOKITTY" | "HEARTS" | "STARS" | "NONE";
  };
  // Tab: PromptPay & ธนาคาร
  payment: {
    promptpayNumber: string;
    bankAccountName: string;
    bankName: string;
    bankAccountNumber: string;
    slip2goEnabled: boolean;
    enablePromptpay: boolean;
    enableSlipUpload: boolean;
    enableGuestPurchase: boolean;
    enableAngpao: boolean;
  };
  // Tab: ระบบแต้ม
  points: {
    fromTopup: boolean;
    fromReview: boolean;
  };
  // Tab: เสียงพื้นหลัง
  sound: {
    welcomePage: boolean;
    musicUrl: string;
    volume: number;
  };
  // Tab: ข้อมูลปลอม
  fakeData: {
    fakeUsers: number;
    fakeTopupCount: number;
    fakeSellCount: number;
  };
  // Tab: Custom Component
  customComponents: { html: string; sortOrder: number; isActive: boolean }[];
  // Tab: Google Search Console
  gsc: {
    enabled: boolean;
    propertyUrl: string;
    verificationCode: string;
    sitemapEnabled: boolean;
    lastSubmittedAt: string;
    notes: string;
  };
}

export const DEFAULT_SETTINGS: SiteSettingsData = {
  general: {
    ownerPhone: "089-999-9999",
    siteName: "OHayo Shop",
    announcement: "ยินดีต้อนรับสู่ O-Hayo — จำหน่าย ID Roblox และ Item ครบวงจร 🎀",
    featuredTitle: "สินค้าแนะนำสำหรับคุณ",
    toggles: {
      reviews: false,
      recentPurchases: true,
      claims: false,
      announcementBar: false,
      statusPage: false,
      sortFeaturedByPrice: false,
      chat: false,
      statUsers: true,
      statTopup: true,
      statStock: true,
    },
  },
  meta: {
    title: "OHayo Shop — จำหน่าย ID Roblox และ Item แบบครบวงจร",
    description: "ปลอดภัย เชื่อถือได้ 100% · รวดเร็ว ส่งไว ทันใจ · บริการดี ดูแลทุกออเดอร์",
    keywords: "Roblox, ID Roblox, Blox Spin, Grow a Garden 2, เติมเงิน",
    photoUrl: "/assets/og-image.svg",
  },
  discord: {
    inviteLink: "https://discord.gg/ohayo",
    webhooks: {
      topup: "",
      purchase: "",
      claim: "",
      preorder: "",
      register: "",
      login: "",
      logout: "",
      stock: "",
    },
  },
  banners: ["/assets/hero-banner.svg", "", ""],
  branding: {
    logoUrl: "/assets/logo.svg",
    loadingLogoUrl: "/assets/logo.svg",
    footerLogoUrl: "/assets/logo.svg",
    backgroundUrl: "",
    backgroundOpacity: 0.5,
    panelTransparency: 7,
  },
  navButtons: [
    { imageUrl: "/assets/nav-1.svg", link: "/products" },
    { imageUrl: "/assets/nav-2.svg", link: "/topup" },
    { imageUrl: "/assets/nav-3.svg", link: "/minigame" },
    { imageUrl: "/assets/nav-4.svg", link: "/contact" },
  ],
  adBanner: {
    imageOrHtml: "",
    dropShadow: 0.3,
    subBanners: [],
  },
  font: "Prompt",
  theme: {
    primary: "#FF6FB3",
    secondary: "#6CB8FF",
    background: "#F6F7FF",
    text: "#2E2E3A",
    opacity: 1,
    particle: "HELLOKITTY",
  },
  payment: {
    promptpayNumber: "089-999-9999",
    bankAccountName: "OHayo Shop",
    bankName: "ธนาคารกสิกรไทย",
    bankAccountNumber: "123-4-56789-0",
    slip2goEnabled: false,
    enablePromptpay: true,
    enableSlipUpload: true,
    enableGuestPurchase: false,
    enableAngpao: true,
  },
  points: {
    fromTopup: false,
    fromReview: false,
  },
  sound: {
    welcomePage: false,
    musicUrl: "",
    volume: 0.5,
  },
  fakeData: {
    fakeUsers: 100,
    fakeTopupCount: 4000,
    fakeSellCount: 150,
  },
  customComponents: [],
  gsc: {
    enabled: false,
    propertyUrl: "",
    verificationCode: "",
    sitemapEnabled: true,
    lastSubmittedAt: "",
    notes: "",
  },
};

/** deep-merge เพื่อรองรับ field ใหม่ที่ยังไม่มีใน DB */
function mergeSettings(base: any, override: any): any {
  if (Array.isArray(base)) return override ?? base;
  if (typeof base === "object" && base !== null) {
    const out: any = { ...base };
    for (const key of Object.keys(base)) {
      if (override && key in override) {
        out[key] = mergeSettings(base[key], override[key]);
      }
    }
    return out;
  }
  return override ?? base;
}

export async function getSettings(): Promise<SiteSettingsData> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(row.json);
    const merged = mergeSettings(DEFAULT_SETTINGS, parsed) as SiteSettingsData;
    // กัน font ค่าแปลกจาก DB
    const validFonts: SiteSettingsData["font"][] = ["Prompt", "Thai RG", "SF Pro"];
    if (!validFonts.includes(merged.font)) {
      merged.font = DEFAULT_SETTINGS.font;
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(data: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
  const current = await getSettings();
  const merged = mergeSettings(current, data);
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", json: JSON.stringify(merged) },
    update: { json: JSON.stringify(merged) },
  });
  return merged;
}
