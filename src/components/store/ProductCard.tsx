import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPriceRange } from "@/lib/utils";

export interface ProductCardData {
  name: string;
  slug: string;
  no?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  priceMin?: number | null;
  priceMax?: number | null;
  stock: number;
  featured?: boolean;
  bestseller?: boolean;
  special?: boolean;
  warranty?: boolean;
  badgeLabel?: string | null;
  badgeColor?: string | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const soldOut = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.no ?? product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/70 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-kawaii"
    >
      {/* รูปสินค้า + กรอบไล่เฉด */}
      <div className="relative m-2 aspect-square overflow-hidden rounded-2xl bg-kawaii-gradient p-1">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-accent to-secondary/20">
          <img
            src={product.imageUrl ?? "/assets/mascot.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Badge มุมซ้ายบน */}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
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
        </div>
      </div>

      {/* เนื้อหา */}
      <div className="flex flex-1 flex-col px-3 pb-3">
        <h3 className="truncate font-bold text-foreground">{product.name}</h3>
        <p className="mb-2 line-clamp-1 min-h-[1.25rem] text-xs text-muted-foreground">
          {product.description || "ดูเพิ่มเติม"}
        </p>

        <p className="text-lg font-extrabold text-danger">
          {formatPriceRange(product.price, product.priceMin, product.priceMax)}
        </p>

        <p className="mb-3 mt-0.5 text-xs font-semibold">
          {soldOut ? (
            <span className="text-danger">สินค้าหมด</span>
          ) : (
            <span className="text-success">📦 คงเหลือ: {product.stock}</span>
          )}
        </p>

        <span className="mt-auto inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-primary-gradient text-sm font-semibold text-white shadow-kawaii transition-all group-hover:brightness-105">
          <Eye className="size-4" /> ดูสินค้า
        </span>
      </div>
    </Link>
  );
}
