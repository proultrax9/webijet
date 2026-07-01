import { prisma } from "./prisma";
import { getSettings } from "./settings";
import { ORDER_STATUS } from "./constants";

export async function getPublicStats() {
  const settings = await getSettings();
  const [userCount, stockAgg, orderCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.aggregate({ _sum: { stock: true }, where: { isActive: true } }),
    prisma.order.count({ where: { status: ORDER_STATUS.COMPLETED } }),
  ]);

  return {
    users: userCount + settings.fakeData.fakeUsers,
    stock: (stockAgg._sum.stock ?? 0),
    sales: orderCount + settings.fakeData.fakeSellCount,
    toggles: settings.general.toggles,
  };
}

export async function getRecentPurchases(limit = 12) {
  const settings = await getSettings();
  if (!settings.general.toggles.recentPurchases) return [];

  const orders = await prisma.order.findMany({
    where: { status: ORDER_STATUS.COMPLETED },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { username: true } },
      items: {
        take: 1,
        include: { product: { select: { name: true, imageUrl: true, price: true } } },
      },
    },
  });

  return orders
    .filter((o) => o.items[0])
    .map((o) => ({
      id: o.id,
      productName: o.items[0].product.name,
      productImage: o.items[0].product.imageUrl,
      buyerName: o.user.username,
      price: o.items[0].price,
      createdAt: o.createdAt.toISOString(),
    }));
}

export async function getFeaturedCategories() {
  return prisma.category.findMany({
    where: { isActive: true, featured: true },
    orderBy: { priority: "desc" },
    take: 6,
    include: { _count: { select: { products: true, children: true } } },
  });
}

export async function getFeaturedProducts(sortByPrice = false) {
  const products = await prisma.product.findMany({
    where: { isActive: true, featured: true },
    orderBy: sortByPrice ? { price: "desc" } : { priority: "desc" },
    take: 12,
  });
  return products;
}

export async function getActiveProducts(opts?: {
  categorySlug?: string;
  search?: string;
  sort?: "price-asc" | "price-desc" | "priority";
}) {
  const where: {
    isActive: boolean;
    category?: { slug: string };
    OR?: Array<
      | { name: { contains: string } }
      | { description: { contains: string } }
    >;
  } = { isActive: true };

  if (opts?.categorySlug) {
    where.category = { slug: opts.categorySlug };
  }
  if (opts?.search) {
    where.OR = [
      { name: { contains: opts.search } },
      { description: { contains: opts.search } },
    ];
  }

  const orderBy =
    opts?.sort === "price-asc"
      ? { price: "asc" as const }
      : opts?.sort === "price-desc"
        ? { price: "desc" as const }
        : { priority: "desc" as const };

  return prisma.product.findMany({
    where,
    orderBy,
    include: { category: { select: { name: true, slug: true } } },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });
}

export async function getActiveFaqs() {
  return prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getActiveMinigame() {
  return prisma.minigame.findFirst({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { prizes: true },
  });
}
