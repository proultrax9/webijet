import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Particles } from "@/components/decor/Particles";
import { ThemeStyles } from "@/components/ThemeStyles";
import { getSettings } from "@/lib/settings";
import { getAdminUser } from "@/lib/session";
import { FONT_MAP } from "@/lib/theme-utils";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  const settings = await getSettings();
  const fontClass = FONT_MAP[settings.font]?.className ?? "font-prompt";

  return (
    <div className={`site-theme-root relative min-h-screen ${fontClass}`}>
      <ThemeStyles settings={settings} />
      <Particles mode={settings.theme.particle} intensity={settings.theme.opacity} />
      <div className="relative z-10 min-h-screen">
        <AdminShell>{children}</AdminShell>
      </div>
    </div>
  );
}
