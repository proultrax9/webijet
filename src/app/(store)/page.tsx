import Link from "next/link";
import { Shield, Zap, Award, Users, Package, ShoppingCart } from "lucide-react";
import { StoreStatCard } from "@/components/store/StoreStatCard";
import { RecentPurchases } from "@/components/store/RecentPurchases";
import { CategoryCard } from "@/components/store/CategoryCard";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/store/SectionHeading";
import { NavButtonRow } from "@/components/store/NavButtonRow";
import { AdBannerBlock } from "@/components/store/AdBannerBlock";
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

  const heroBanner = settings.banners.find((b) => b.trim()) ?? "/assets/hero-banner.svg";
  const base = getSiteBaseUrl(settings.gsc.propertyUrl);

  return (
    <div className="container space-y-10 py-8">
      <JsonLd
        data={[organizationJsonLd(base, settings), websiteJsonLd(base, settings)]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-kawaii-gradient p-6 shadow-kawaii md:p-10">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-sm font-semibold text-primary/80">
            จำหน่าย ID Roblox และ Item แบบครบวงจร
          </p>
          <h1 className="text-4xl font-black tracking-tight text-primary md:text-5xl">
            {settings.general.siteName.replace(" Shop", "").replace("Shop", "") || "O-Hayo"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {settings.general.announcement}
          </p>
        </div>
        <img
          src={heroBanner}
          alt=""
          width={480}
          height={180}
          className="pointer-events-none absolute -right-4 bottom-0 hidden max-h-48 w-auto max-w-[55%] object-contain opacity-90 md:block lg:max-h-56"
          aria-hidden
        />

        <div className="relative z-10 mt-6 flex flex-wrap gap-2">
          {[
            { icon: Shield, text: "ปลอดภัย เชื่อถือได้ 100%" },
            { icon: Zap, text: "รวดเร็ว ส่งไว ทันใจ" },
            { icon: Award, text: "บริการดี ดูแลทุกออเดอร์" },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-sm"
            >
              <Icon className="size-4 text-primary" />
              {text}
            </span>
          ))}
        </div>
      </section>

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
