// lib/discord.ts — Discord webhook (โหมดจำลอง)
// อ้างอิง PROJECT-SPEC Section 11

export type DiscordEvent =
  | "register"
  | "login"
  | "logout"
  | "topup"
  | "purchase"
  | "claim"
  | "preorder"
  | "stock";

export interface DiscordPayload {
  event: DiscordEvent;
  title: string;
  fields: { name: string; value: string }[];
}

const EVENT_COLORS: Record<DiscordEvent, number> = {
  register: 0x6cb8ff,
  login: 0x22c55e,
  logout: 0x94a3b8,
  topup: 0xff6fb3,
  purchase: 0xa06bff,
  claim: 0xef4444,
  preorder: 0xf59e0b,
  stock: 0xef4444,
};

/** ส่งแจ้งเตือน Discord — โหมดจำลองจะ log ลง console แทนการยิงจริง */
export async function sendDiscord(
  webhookUrl: string | undefined,
  payload: DiscordPayload,
): Promise<{ ok: boolean; mocked: boolean }> {
  const isMock = process.env.MOCK_INTEGRATIONS !== "false";

  if (isMock || !webhookUrl) {
    console.log(`[discord:mock] ${payload.event} — ${payload.title}`, payload.fields);
    return { ok: true, mocked: true };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: payload.title,
            color: EVENT_COLORS[payload.event],
            fields: payload.fields.map((f) => ({ ...f, inline: true })),
            timestamp: new Date().toISOString(),
            footer: { text: "OHayo Shop" },
          },
        ],
      }),
    });
    return { ok: res.ok, mocked: false };
  } catch {
    return { ok: false, mocked: false };
  }
}
