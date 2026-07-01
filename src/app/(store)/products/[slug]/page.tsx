import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BuyButton } from "@/components/store/BuyButton";
import { JsonLd } from "@/components/JsonLd";
import { getProductByParam } from "@/lib/store-data";
import { getSettings } from "@/lib/settings";
import { getSiteBaseUrl } from "@/lib/theme-utils";
import { productJsonLd, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { formatPriceRange, formatBaht } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductByParam(params.slug);
  if (!product) return { title: "ไม่พบสินค้า" };

  const settings = await getSettings();
  const desc =
    product.description?.trim() ||
    `${product.name} ราคา ${formatBaht(product.price)} — ${settings.general.siteName} จำหน่าย ID Roblox และ Item ปลอดภัย รวดเร็ว`;
  const image = absoluteUrl(getSiteBaseUrl(settings.gsc.propertyUrl), product.imageUrl ?? "/assets/mascot.svg");
  const canonical = `/products/${product.no ?? product.slug}`;

  return {
    title: product.name,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} | ${settings.general.siteName}`,
      description: desc,
      type: "website",
      siteName: settings.general.siteName,
      locale: "th_TH",
      url: canonical,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductByParam(params.slug);
  if (!product || !product.isActive) notFound();

  const soldOut = product.stock <= 0;

  const settings = await getSettings();
  const base = getSiteBaseUrl(settings.gsc.propertyUrl);

  return (
    <div className="container py-8">
      <JsonLd
        data={[
          productJsonLd(base, product, settings.general.siteName),
          breadcrumbJsonLd(base, [
            { name: "หน้าแรก", path: "/" },
            { name: "สินค้าทั้งหมด", path: "/products" },
            { name: product.name, path: `/products/${product.no ?? product.slug}` },
          ]),
        ]}
      />
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> กลับรายการสินค้า
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/70 bg-kawaii-gradient p-2 shadow-kawaii">
          <div className="aspect-square overflow-hidden rounded-2xl bg-white">
            <img
              src={product.imageUrl ?? "/assets/mascot.svg"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {product.badgeLabel && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: product.badgeColor || "#8b5cf6" }}
              >
                {product.badgeLabel}
              </span>
            )}
            {product.special && <Badge variant="secondary">✨ พิเศษ</Badge>}
            {product.featured && <Badge variant="pink">⭐ แนะนำ</Badge>}
            {product.bestseller && <Badge variant="success">ขายดี</Badge>}
            {product.warranty && <Badge variant="successSoft">🛡 รับประกัน</Badge>}
            <Badge variant="muted">{product.category.name}</Badge>
          </div>

          <h1 className="text-3xl font-black text-foreground">{product.name}</h1>

          <p className="text-2xl font-extrabold text-danger">
            {formatPriceRange(product.price, product.priceMin, product.priceMax)}
          </p>

          <p className="text-sm font-semibold">
            {soldOut ? (
              <span className="text-danger">สินค้าหมด</span>
            ) : (
              <span className="text-success">📦 คงเหลือ: {product.stock}</span>
            )}
          </p>

          {product.duration && (
            <p className="text-sm text-muted-foreground">⏱ ระยะเวลา: {product.duration}</p>
          )}

          {product.videoUrl && (
            <a
              href={product.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              ▶ ดูวิดีโอตัวอย่างสินค้า
            </a>
          )}

          {product.description && (
            <p className="whitespace-pre-line rounded-2xl bg-accent/40 p-4 text-sm leading-relaxed text-foreground/80">
              {product.description}
            </p>
          )}

          <BuyButton
            productId={product.id}
            price={product.price}
            soldOut={soldOut}
            minQty={product.minQty}
            maxQty={product.maxQty}
            stock={product.stock}
            promoBuyQty={product.promoBuyQty}
            promoFreeQty={product.promoFreeQty}
          />

          <p className="text-xs text-muted-foreground">
            ระบบจะหักเงินจากกระเป๋าเงินของคุณและส่งข้อมูลสินค้าดิจิทัลทันทีหลังชำระสำเร็จ
          </p>
        </div>
      </div>
    </div>
  );
}
