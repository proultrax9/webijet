import Link from "next/link";
import { Users, Package, ShoppingCart } from "lucide-react";
import { StoreStatCard } from "@/components/store/StoreStatCard";
import { RecentPurchases } from "@/components/store/RecentPurchases";
import { CategoryCard } from "@/components/store/CategoryCard";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/store/SectionHeading";
import { NavButtonRow } from "@/components/store/NavButtonRow";
import { AdBannerBlock } from "@/components/store/AdBannerBlock";
import { HeroBannerCarousel } from "@/components/store/HeroBannerCarousel";
import { CustomHtmlBlock } from "@/components/store/CustomHtmlBlock";
import { JsonLd } from "@/components/JsonLd";
import {
  getPublicStats,
  getRecentPurchases,
  getFeaturedCategories,
  getFeaturedProducts,
} from "@/lib/store-data";
import { getSettings } from "@/lib/settings";
import { getSiteBaseUrl } from "@/lib/theme-utils";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const sortByPrice = settings.general.toggles.sortFeaturedByPrice;

  const [stats, recent, categories, products] = await Promise.all([
    getPublicStats(),
    getRecentPurchases(),
    getFeaturedCategories(),
    getFeaturedProducts(sortByPrice),
  ]);

  const heroBanners = settings.banners.map((b) => b.trim()).filter(Boolean);
  if (heroBanners.length === 0) heroBanners.push("/assets/hero-banner.svg");
  const siteName =
    settings.general.siteName.replace(" Shop", "").replace("Shop", "") || "O-Hayo";
  const base = getSiteBaseUrl(settings.gsc.propertyUrl);

  return (
    <div className="container space-y-10 py-8">
      <JsonLd
        data={[organizationJsonLd(base, settings), websiteJsonLd(base, settings)]}
      />
      {/* Hero — banner สไลด์เต็มความกว้าง (ตั้งรูปได้ที่ จัดการระบบ → ตั้งค่า → Banner) */}
      <div>
        <h1 className="sr-only">{siteName} — จำหน่าย ID Roblox และ Item แบบครบวงจร</h1>
        <HeroBannerCarousel
          banners={heroBanners}
          alt={`${siteName} — จำหน่าย ID Roblox และ Item แบบครบวงจร`}
        />
      </div>

      <NavButtonRow buttons={settings.navButtons} />
      <AdBannerBlock
        imageOrHtml={settings.adBanner.imageOrHtml}
        dropShadow={settings.adBanner.dropShadow}
      />

      {/* Stats */}
      {(stats.toggles.statUsers || stats.toggles.statStock || stats.toggles.statTopup) && (
        <section className="grid gap-4 sm:grid-cols-3">
          {stats.toggles.statUsers && (
            <StoreStatCard label="ผู้ใช้งาน" value={stats.users} unit="คน" icon={Users} />
          )}
          {stats.toggles.statStock && (
            <StoreStatCard label="สต็อก" value={stats.stock} unit="ชิ้น" icon={Package} />
          )}
          {stats.toggles.statTopup && (
            <StoreStatCard label="ยอดขาย" value={stats.sales} unit="ครั้ง" icon={ShoppingCart} />
          )}
        </section>
      )}

      {/* Recent purchases */}
      {recent.length > 0 && (
        <section>
          <SectionHeading
            title="รายการสินค้าล่าสุด"
            subtitle="สินค้าที่ลูกค้าเพิ่งซื้อไปเมื่อสักครู่"
          />
          <RecentPurchases items={recent} />
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <SectionHeading
            title="หมวดหมู่แนะนำสำหรับคุณ"
            subtitle="หมวดหมู่คัดสรรพิเศษ"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={{
                  name: cat.name,
                  slug: cat.slug,
                  imageUrl: cat.imageUrl,
                  featured: cat.featured,
                  productCount: cat._count.products,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {products.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <SectionHeading
              title={settings.general.featuredTitle}
              subtitle="สินค้าคัดสรรพิเศษ"
              className="mb-0"
            />
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 border-primary/30 bg-white px-5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              ดูสินค้า →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <CustomHtmlBlock components={settings.customComponents} />
    </div>
  );
}
