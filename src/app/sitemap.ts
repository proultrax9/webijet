import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getSiteBaseUrl } from "@/lib/theme-utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  if (!settings.gsc.sitemapEnabled) return [];

  const base = getSiteBaseUrl(settings.gsc.propertyUrl);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/topup`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/minigame`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
