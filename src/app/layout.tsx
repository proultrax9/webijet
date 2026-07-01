import type { Metadata } from "next";
import { Kanit, Prompt } from "next/font/google";
import { getSettings } from "@/lib/settings";
import { getSiteBaseUrl } from "@/lib/theme-utils";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const base = getSiteBaseUrl(settings.gsc.propertyUrl);
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(base);
  } catch {
    metadataBase = undefined;
  }

  return {
    metadataBase,
    title: {
      default: settings.meta.title,
      template: `%s | ${settings.general.siteName}`,
    },
    description: settings.meta.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${prompt.variable} ${kanit.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
