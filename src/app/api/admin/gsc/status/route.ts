import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings";
import { getSiteBaseUrl } from "@/lib/theme-utils";
import { getAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "ต้องเป็นผู้ดูแลระบบ" }, { status: 403 });
  }
  try {
    const settings = await getSettings();
    const base = getSiteBaseUrl(settings.gsc.propertyUrl);
    const sitemapUrl = `${base}/sitemap.xml`;

    const checks: string[] = [];

    if (!settings.gsc.enabled) {
      checks.push("ยังไม่ได้เปิดใช้งาน GSC");
    }
    if (!settings.gsc.propertyUrl) {
      checks.push("ยังไม่ได้ใส่ Property URL");
    }
    if (!settings.gsc.verificationCode) {
      checks.push("ยังไม่ได้ใส่ Verification Code");
    } else {
      checks.push("Meta verification พร้อมฝังในหน้าเว็บ");
    }
    if (settings.gsc.sitemapEnabled) {
      checks.push(`Sitemap: ${sitemapUrl}`);
    }

    // บันทึกเวลาตรวจสอบล่าสุด
    if (settings.gsc.enabled) {
      await saveSettings({
        gsc: {
          ...settings.gsc,
          lastSubmittedAt: new Date().toISOString(),
        },
      });
    }

    const ready =
      settings.gsc.enabled &&
      !!settings.gsc.propertyUrl &&
      !!settings.gsc.verificationCode;

    return NextResponse.json({
      ok: true,
      ready,
      message: ready
        ? "พร้อมเชื่อมต่อ GSC — ไปกด Verify ใน Google Search Console แล้ว submit sitemap"
        : checks.join(" · "),
      sitemapUrl,
      robotsUrl: `${base}/robots.txt`,
      checks,
    });
  } catch (err) {
    console.error("[gsc:status]", err);
    return NextResponse.json({ ok: false, error: "ตรวจสอบไม่สำเร็จ" }, { status: 500 });
  }
}
