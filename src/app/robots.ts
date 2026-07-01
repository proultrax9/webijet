import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";
import { getSiteBaseUrl } from "@/lib/theme-utils";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const base = getSiteBaseUrl(settings.gsc.propertyUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: settings.gsc.sitemapEnabled ? `${base}/sitemap.xml` : undefined,
  };
}
