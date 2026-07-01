import { getSettings } from "@/lib/settings";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, faqs] = await Promise.all([
    getSettings(),
    prisma.faq.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return <SettingsPanel initial={settings} faqs={faqs} />;
}
