import { NextResponse } from "next/server";
import { sendDiscord, type DiscordEvent } from "@/lib/discord";
import { getAdminUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const EVENT_TITLE: Record<string, string> = {
  register: "ทดสอบ: สมัครสมาชิก",
  login: "ทดสอบ: เข้าสู่ระบบ",
  logout: "ทดสอบ: ออกจากระบบ",
  topup: "ทดสอบ: เติมเงิน",
  purchase: "ทดสอบ: ซื้อสินค้า/มินิเกม",
  claim: "ทดสอบ: เคลมสินค้า",
  preorder: "ทดสอบ: สั่งซื้อล่วงหน้า",
  stock: "ทดสอบ: แจ้งเตือนสต็อก",
};

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "ต้องเป็นผู้ดูแลระบบ" }, { status: 403 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as {
      webhook?: string;
      event?: string;
    };
    const event = (body.event ?? "topup") as DiscordEvent;
    const result = await sendDiscord(body.webhook, {
      event,
      title: EVENT_TITLE[event] ?? "ทดสอบ Discord Webhook",
      fields: [
        { name: "สถานะ", value: "ทดสอบระบบ" },
        { name: "เวลา", value: new Date().toLocaleString("th-TH") },
      ],
    });
    return NextResponse.json({ ok: true, mocked: result.mocked });
  } catch (err) {
    console.error("[discord:test]", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
