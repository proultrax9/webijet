import type { SiteSettingsData } from "./settings";

/** แปลง path/URL ให้เป็น absolute URL */
export function absoluteUrl(base: string, url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function organizationJsonLd(base: string, settings: SiteSettingsData) {
  const sameAs = settings.discord.inviteLink?.trim() ? [settings.discord.inviteLink] : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.general.siteName,
    url: base,
    logo: absoluteUrl(base, settings.branding.logoUrl),
    description: settings.meta.description,
    ...(sameAs ? { sameAs } : {}),
  };
}

export function websiteJsonLd(base: string, settings: SiteSettingsData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.general.siteName,
    url: base,
    inLanguage: "th-TH",
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(
  base: string,
  product: {
    name: string;
    slug: string;
    no?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    price: number;
    stock: number;
    category?: { name: string } | null;
  },
  siteName: string,
) {
  const image = absoluteUrl(base, product.imageUrl ?? "/assets/mascot.svg");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(image ? { image: [image] } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    brand: { "@type": "Brand", name: siteName },
    offers: {
      "@type": "Offer",
      url: `${base}/products/${product.no ?? product.slug}`,
      priceCurrency: "THB",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: siteName },
    },
  };
}

export function breadcrumbJsonLd(base: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}
