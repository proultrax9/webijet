import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CategoryCardData {
  name: string;
  slug: string;
  imageUrl?: string | null;
  featured?: boolean;
  productCount: number;
}

export function CategoryCard({ category }: { category: CategoryCardData }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-kawaii"
    >
      {/* แบนเนอร์ — fix สัดส่วน 1640×500 บีบรูปให้เต็มกรอบเหมือน hero banner */}
      <div className="relative aspect-[1640/500] overflow-hidden bg-gradient-to-br from-primary/20 via-accent to-secondary/20">
        <img
          src={category.imageUrl ?? "/assets/mascot.svg"}
          alt={category.name}
          className="h-full w-full object-fill transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-extrabold text-foreground">{category.name}</h3>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          ดูเพิ่มเติม
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>

        <div className="mt-auto flex items-center justify-between pt-3">
          {category.featured ? (
            <Badge variant="pink">⭐ แนะนำ</Badge>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            0 หมวดหมู่ · {category.productCount} สินค้า
          </span>
        </div>
      </div>
    </Link>
  );
}
