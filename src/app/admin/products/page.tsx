import Link from "next/link";
import { Package, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatBaht } from "@/lib/utils";
import { DeleteCategoryButton, DeleteProductButton } from "@/components/admin/AdminActions";
import { CreateProductButton, EditProductButton } from "@/components/admin/ProductForms";
import { CreateCategoryButton, EditCategoryButton } from "@/components/admin/CategoryForm";
import { ManageStockButton } from "@/components/admin/StockManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab === "categories" ? "categories" : "products";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { priority: "desc" },
      include: { parent: { select: { name: true } } },
    }),
    prisma.product.findMany({
      orderBy: { priority: "desc" },
      include: { category: { select: { name: true } } },
    }),
  ]);

  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div>
      <PageHeader
        icon={<Package className="size-6" />}
        title="จัดการสินค้า"
        subtitle="จัดการหมวดหมู่ สินค้า และสต็อค"
        actions={
          tab === "categories" ? (
            <CreateCategoryButton categories={categoryOptions} />
          ) : (
            <CreateProductButton categories={categoryOptions} />
          )
        }
      />

      {/* แท็บอิง URL (?tab=...) เพื่อให้ปุ่มด้านบนเปลี่ยนตามแท็บที่เลือกเสมอ */}
      <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl bg-muted/60 p-1.5">
        {(
          [
            { value: "categories", label: "จัดการหมวดหมู่", href: "/admin/products?tab=categories" },
            { value: "products", label: "จัดการสินค้า", href: "/admin/products" },
          ] as const
        ).map((t) => (
          <Link
            key={t.value}
            href={t.href}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
              tab === t.value
                ? "bg-primary-gradient text-primary-foreground shadow-kawaii"
                : "text-muted-foreground hover:bg-white/70 hover:text-primary",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "categories" && (
        <div className="mt-4 animate-fade-up">
          <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>รูปภาพ</TableHead>
                  <TableHead>ชื่อหมวดหมู่</TableHead>
                  <TableHead>หมวดหมู่หลัก</TableHead>
                  <TableHead>SLUG</TableHead>
                  <TableHead>PRIORITY</TableHead>
                  <TableHead>FEATURED</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="h-10 w-16 rounded-lg border object-cover"
                        />
                      ) : (
                        <span className="grid h-10 w-16 place-items-center rounded-lg border bg-muted text-muted-foreground">
                          <ImageIcon className="size-4" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.parent?.name ?? "หมวดหมู่หลัก"}
                    </TableCell>
                    <TableCell>{c.slug}</TableCell>
                    <TableCell>
                      <Badge variant="muted">{c.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      {c.featured && <Badge variant="pink">Featured</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "successSoft" : "muted"}>
                        {c.isActive ? "เปิดใช้งานอยู่" : "ปิด"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <EditCategoryButton
                          category={{
                            id: c.id,
                            name: c.name,
                            slug: c.slug,
                            description: c.description,
                            imageUrl: c.imageUrl,
                            parentId: c.parentId,
                            priority: c.priority,
                            featured: c.featured,
                            isActive: c.isActive,
                          }}
                          categories={categoryOptions}
                        />
                        <DeleteCategoryButton id={c.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="mt-4 animate-fade-up">
          <p className="mb-3 text-sm text-muted-foreground">ทั้งหมด {products.length} รายการ</p>
          <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>P</TableHead>
                  <TableHead>รูปภาพ</TableHead>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead>STOCK</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.priority}</TableCell>
                    <TableCell>
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-10 w-16 rounded-lg border object-cover"
                        />
                      ) : (
                        <span className="grid h-10 w-16 place-items-center rounded-lg border bg-muted text-muted-foreground">
                          <ImageIcon className="size-4" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{p.name}</p>
                      {p.featured && (
                        <Badge variant="pink" className="mt-1">
                          แนะนำ
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.stock <= 0 ? (
                        <Badge variant="dangerSoft">หมด</Badge>
                      ) : (
                        <span className="font-bold text-success">{p.stock}</span>
                      )}
                    </TableCell>
                    <TableCell>{p.category.name}</TableCell>
                    <TableCell className="font-bold">{formatBaht(p.price)}</TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "successSoft" : "muted"}>
                        {p.isActive ? "เปิด" : "ปิด"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <EditProductButton
                          product={{
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            description: p.description,
                            imageUrl: p.imageUrl,
                            downloadUrl: p.downloadUrl,
                            videoUrl: p.videoUrl,
                            duration: p.duration,
                            price: p.price,
                            resellerPrice: p.resellerPrice,
                            discountPct: p.discountPct,
                            stock: p.stock,
                            priority: p.priority,
                            minQty: p.minQty,
                            maxQty: p.maxQty,
                            featured: p.featured,
                            bestseller: p.bestseller,
                            special: p.special,
                            warranty: p.warranty,
                            isPreorder: p.isPreorder,
                            requiresInput: p.requiresInput,
                            isActive: p.isActive,
                            allowPoints: p.allowPoints,
                            promoBuyQty: p.promoBuyQty,
                            promoFreeQty: p.promoFreeQty,
                            installment: p.installment,
                            colorPrimary: p.colorPrimary,
                            colorSecondary: p.colorSecondary,
                            badgeLabel: p.badgeLabel,
                            badgeColor: p.badgeColor,
                            categoryId: p.categoryId,
                          }}
                          categories={categoryOptions}
                        />
                        <ManageStockButton productId={p.id} productName={p.name} />
                        <DeleteProductButton id={p.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
