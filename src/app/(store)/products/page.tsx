import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/store/SectionHeading";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getActiveProducts, getAllCategories } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const category = searchParams.category ?? "";
  const sort = (searchParams.sort as "price-asc" | "price-desc" | "priority") ?? "priority";

  const [products, categories] = await Promise.all([
    getActiveProducts({
      search: q || undefined,
      categorySlug: category || undefined,
      sort,
    }),
    getAllCategories(),
  ]);

  return (
    <div className="container space-y-6 py-8">
      <SectionHeading title="สินค้าทั้งหมด" subtitle="ค้นหาและเลือกซื้อสินค้าที่ต้องการ" />

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/70 bg-card p-4 shadow-soft">
        <div className="min-w-[200px] flex-1 space-y-1">
          <label htmlFor="q" className="text-xs font-semibold text-muted-foreground">
            ค้นหา
          </label>
          <Input id="q" name="q" defaultValue={q} placeholder="ชื่อสินค้า, คำอธิบาย..." />
        </div>
        <div className="w-48 space-y-1">
          <label htmlFor="category" className="text-xs font-semibold text-muted-foreground">
            หมวดหมู่
          </label>
          <Select id="category" name="category" defaultValue={category}>
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40 space-y-1">
          <label htmlFor="sort" className="text-xs font-semibold text-muted-foreground">
            เรียงตาม
          </label>
          <Select id="sort" name="sort" defaultValue={sort}>
            <option value="priority">ความสำคัญ</option>
            <option value="price-asc">ราคา น้อย→มาก</option>
            <option value="price-desc">ราคา มาก→น้อย</option>
          </Select>
        </div>
        <Button type="submit">ค้นหา</Button>
      </form>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">ไม่พบสินค้าตามเงื่อนไข</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        ทั้งหมด {products.length} รายการ ·{" "}
        <Link href="/" className="text-primary hover:underline">
          กลับหน้าแรก
        </Link>
      </p>
    </div>
  );
}
