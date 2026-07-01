import type { Metadata } from "next";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { Particles } from "@/components/decor/Particles";
import { CornerMascot } from "@/components/decor/CornerMascot";
import { ThemeStyles } from "@/components/ThemeStyles";
import { BackgroundMusic } from "@/components/store/BackgroundMusic";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { FONT_MAP } from "@/lib/theme-utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const keywords = settings.meta.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const metadata: Metadata = {
    title: settings.meta.title,
    description: settings.meta.description,
    keywords,
    authors: [{ name: `${settings.general.siteName} Admin` }],
    alternates: { canonical: "/" },
    openGraph: {
      title: settings.meta.title,
      description: settings.meta.description,
      type: "website",
      siteName: settings.general.siteName,
      locale: "th_TH",
      url: "/",
      images: settings.meta.photoUrl ? [{ url: settings.meta.photoUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.meta.title,
      description: settings.meta.description,
      images: settings.meta.photoUrl ? [settings.meta.photoUrl] : undefined,
    },
    robots: { index: true, follow: true },
  };

  if (settings.gsc.enabled && settings.gsc.verificationCode) {
    metadata.verification = {
      google: settings.gsc.verificationCode,
    };
  }

  return metadata;
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  const fontClass = FONT_MAP[settings.font]?.className ?? "font-prompt";

  return (
    <div className={`site-theme-root relative flex min-h-screen flex-col ${fontClass}`}>
      <ThemeStyles settings={settings} />
      <Particles mode={settings.theme.particle} intensity={settings.theme.opacity} />
      <BackgroundMusic
        enabled={settings.sound.welcomePage}
        url={settings.sound.musicUrl}
        volume={settings.sound.volume}
      />

      <Navbar
        user={user}
        siteName={settings.general.siteName}
        logoUrl={settings.branding.logoUrl}
      />

      {settings.general.toggles.announcementBar && settings.general.announcement && (
        <div className="relative z-10 bg-primary-gradient py-2 text-center text-sm font-medium text-white">
          {settings.general.announcement}
        </div>
      )}

      <main className="relative z-10 flex-1">{children}</main>

      <Footer
        siteName={settings.general.siteName}
        discordLink={settings.discord.inviteLink}
        footerLogoUrl={settings.branding.footerLogoUrl}
      />
      <CornerMascot position="bottom-left" />
      <CornerMascot position="bottom-right" />
    </div>
  );
}
