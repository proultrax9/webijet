import { NextResponse } from "next/server";
import { getSettings, saveSettings, type SiteSettingsData } from "@/lib/settings";
import { getAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "ต้องเป็นผู้ดูแลระบบ" }, { status: 403 });
  }
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ ok: false, error: "ต้องเป็นผู้ดูแลระบบ" }, { status: 403 });
    }
    const body = (await req.json()) as Partial<SiteSettingsData>;
    const saved = await saveSettings(body);
    return NextResponse.json({ ok: true, settings: saved });
  } catch (err) {
    console.error("[settings:PUT]", err);
    return NextResponse.json(
      { ok: false, error: "ไม่สามารถบันทึกการตั้งค่าได้" },
      { status: 400 },
    );
  }
}
