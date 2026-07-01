import { Package } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { CreateCategoryButton, CreateProductButton } from "@/components/admin/ProductForms";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab === "categories" ? "categories" : "products";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { priority: "desc" } }),
    prisma.product.findMany({
      orderBy: { priority: "desc" },
      include: { category: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader
        icon={<Package className="size-6" />}
        title="จัดการสินค้า"
        subtitle="จัดการหมวดหมู่ สินค้า และสต็อค"
        actions={
          tab === "categories" ? (
            <CreateCategoryButton />
          ) : (
            <CreateProductButton categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
          )
        }
      />

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="categories">จัดการหมวดหมู่</TabsTrigger>
          <TabsTrigger value="products">จัดการสินค้า</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>ชื่อหมวดหมู่</TableHead>
                  <TableHead>SLUG</TableHead>
                  <TableHead>PRIORITY</TableHead>
                  <TableHead>FEATURED</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-semibold">{c.name}</TableCell>
                    <TableCell>{c.slug}</TableCell>
                    <TableCell>{c.priority}</TableCell>
                    <TableCell>
                      {c.featured && <Badge variant="pink">Featured</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? "successSoft" : "muted"}>
                        {c.isActive ? "เปิดใช้งานอยู่" : "ปิด"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeleteCategoryButton id={c.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <p className="mb-3 text-sm text-muted-foreground">ทั้งหมด {products.length} รายการ</p>
          <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>P</TableHead>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead>STOCK</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.priority}</TableCell>
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
                      <DeleteProductButton id={p.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
