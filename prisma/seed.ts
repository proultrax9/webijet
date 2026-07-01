import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { DEFAULT_SETTINGS } from "../src/lib/settings";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

// helper: random เวลาย้อนหลัง n นาที
const minsAgo = (m: number) => new Date(Date.now() - m * 60 * 1000);
const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

async function main() {
  console.log("🌱 เริ่ม seed ข้อมูล OHayo Shop...");

  // ล้างข้อมูลเดิม (dev)
  await prisma.minigamePlay.deleteMany();
  await prisma.minigamePrize.deleteMany();
  await prisma.minigame.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.topup.deleteMany();
  await prisma.stockItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.redeemCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.siteSettings.deleteMany();

  // ===== Users =====
  // รหัสผ่านแอดมินอ่านจาก env (กันรหัส default หลุด) — ถ้าไม่ตั้งจะสุ่มให้และพิมพ์ออก console
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@ohayo.shop";
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString("base64url");

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      username: "vvs_admin",
      role: "ADMIN",
      balance: 9999,
      points: 1200,
      passwordHash: hashPassword(adminPassword),
      avatarUrl: "/assets/mascot.svg",
      createdAt: daysAgo(120),
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "lonnachai.jet2@gmail.com",
      username: "lonnachai",
      role: "USER",
      balance: 350,
      points: 80,
      passwordHash: hashPassword(process.env.SEED_USER_PASSWORD || "user1234"),
      createdAt: daysAgo(30),
    },
  });

  const extraUsers = await Promise.all(
    ["Aekapon", "Nammon", "Praewa", "Tanaporn", "Kitty_Fan", "BloxKing", "GardenGirl", "TitanZ"].map(
      (name, i) =>
        prisma.user.create({
          data: {
            email: `${name.toLowerCase()}@example.com`,
            username: name,
            role: "USER",
            balance: Math.round(Math.random() * 500),
            points: Math.round(Math.random() * 200),
            passwordHash: "demo",
            createdAt: daysAgo(i * 3 + 2),
          },
        }),
    ),
  );

  // ===== Categories =====
  const bloxSpin = await prisma.category.create({
    data: {
      name: "Blox Spin",
      slug: "blox-spin",
      imageUrl: "/assets/categories/blox-spin.svg",
      priority: 99,
      featured: true,
      isActive: true,
    },
  });
  const garden = await prisma.category.create({
    data: {
      name: "Grow a Garden 2",
      slug: "grow-a-garden-2",
      imageUrl: "/assets/categories/grow-a-garden-2.svg",
      priority: 90,
      featured: true,
      isActive: true,
    },
  });
  const aot = await prisma.category.create({
    data: {
      name: "Attack on Titan Revolution",
      slug: "attack-on-titan",
      imageUrl: "/assets/categories/attack-on-titan.svg",
      priority: 80,
      featured: true,
      isActive: true,
    },
  });

  // ===== Products =====
  type P = {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    price: number;
    priceMin?: number;
    priceMax?: number;
    stock: number;
    priority: number;
    featured?: boolean;
    bestseller?: boolean;
    isActive?: boolean;
    categoryId: string;
  };

  const products: P[] = [
    {
      name: "ไก่ตัน BloxSpin เงิน 1-1.2M",
      slug: "bloxspin-1-1-2m",
      description: "ไก่ตัน Blox Spin เงิน 1M เพียงแค่คุณสั่งก็รับได้ ปลอดภัย รวดเร็ว ทันใจ",
      imageUrl: "/assets/products/bloxspin.svg",
      price: 45,
      stock: 24,
      priority: 99,
      featured: true,
      categoryId: bloxSpin.id,
    },
    {
      name: "ไก่ตัน BloxSpin เงิน 1.3-1.5M",
      slug: "bloxspin-1-3-1-5m",
      description: "ไก่ตัน Blox Spin เงิน 1.3-1.5M สั่งง่าย ส่งไว การันตีของแท้",
      imageUrl: "/assets/products/bloxspin.svg",
      price: 50,
      stock: 0,
      priority: 98,
      categoryId: bloxSpin.id,
    },
    {
      name: "Mega Seed",
      slug: "mega-seed",
      description: "เพียงแค่คุณสั่งซื้อก็สามารถได้ไอเทม Mega Seed ในเกม Grow a Garden 2",
      imageUrl: "/assets/products/mega-seed.svg",
      price: 10,
      priceMin: 10,
      priceMax: 80,
      stock: 34,
      priority: 70,
      bestseller: true,
      categoryId: garden.id,
    },
    {
      name: "Rainbow Seed",
      slug: "rainbow-seed",
      description: "เพียงแค่คุณสั่งซื้อก็สามารถได้ไอเทม Rainbow Seed หายากสุด ๆ",
      imageUrl: "/assets/products/rainbow-seed.svg",
      price: 5,
      priceMin: 5,
      priceMax: 10,
      stock: 8,
      priority: 60,
      featured: true,
      categoryId: garden.id,
    },
    {
      name: "Gold Seed",
      slug: "gold-seed",
      description: "เพียงแค่คุณสั่งซื้อก็สามารถได้ไอเทม Gold Seed พร้อมส่งทันที",
      imageUrl: "/assets/products/gold-seed.svg",
      price: 10,
      priceMin: 5,
      priceMax: 40,
      stock: 60,
      priority: 59,
      featured: true,
      categoryId: garden.id,
    },
    {
      name: "Hypno Bloom",
      slug: "hypno-bloom",
      description: "ไอเทมดอกไม้สะกดจิต Hypno Bloom สวยหายากในเกม Grow a Garden 2",
      imageUrl: "/assets/products/hypno-bloom.svg",
      price: 35,
      stock: 7,
      priority: 56,
      bestseller: true,
      categoryId: garden.id,
    },
    {
      name: "Dragon's Breath",
      slug: "dragons-breath",
      description: "เพียงแค่คุณสั่งซื้อก็สามารถได้ไอเทม Dragon's Breath พลังไฟมังกร",
      imageUrl: "/assets/products/dragons-breath.svg",
      price: 30,
      stock: 24,
      priority: 55,
      bestseller: true,
      categoryId: garden.id,
    },
    {
      name: "Super Watering",
      slug: "super-watering",
      description: "บัวรดน้ำพลังพิเศษ Super Watering เร่งการเติบโตของพืชในสวน",
      imageUrl: "/assets/products/super-watering.svg",
      price: 15,
      stock: 40,
      priority: 50,
      featured: true,
      categoryId: garden.id,
    },
    {
      name: "AOT Revolution — ID พร้อมเล่น",
      slug: "aot-revolution-id",
      description: "ไอดี Attack on Titan Revolution พร้อมเล่น เลเวลสูง ปลดล็อกครบ",
      imageUrl: "/assets/products/aot.svg",
      price: 120,
      priceMin: 120,
      priceMax: 350,
      stock: 5,
      priority: 45,
      featured: true,
      categoryId: aot.id,
    },
  ];

  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        ...p,
        isActive: p.isActive ?? true,
      },
    });
    // stock items ตามจำนวน stock (จำกัดไม่เกิน 60 เพื่อความเร็ว seed)
    const n = Math.min(created.stock, 60);
    if (n > 0) {
      await prisma.stockItem.createMany({
        data: Array.from({ length: n }).map((_, i) => ({
          productId: created.id,
          content: `${p.slug.toUpperCase()}-KEY-${String(i + 1).padStart(4, "0")}`,
        })),
      });
    }
  }

  const allProducts = await prisma.product.findMany();
  const allUsers = [customer, ...extraUsers];

  // ===== Orders (ประวัติการขาย) =====
  for (let i = 0; i < 30; i++) {
    const buyer = allUsers[i % allUsers.length];
    const prod = allProducts[i % allProducts.length];
    const created = minsAgo(i * 37 + 5);
    const order = await prisma.order.create({
      data: {
        billNumber: `BILL-${created.getTime()}-${1000 + i}`,
        userId: buyer.id,
        totalPrice: prod.price,
        status: i % 7 === 0 ? "PENDING" : i % 5 === 0 ? "PROCESSING" : "COMPLETED",
        createdAt: created,
      },
    });
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: prod.id,
        price: prod.price,
        delivered: `${prod.slug.toUpperCase()}-KEY-DELIVERED`,
      },
    });
  }

  // ===== Topups (ประวัติเติมเงิน) =====
  const methods = ["ANGPAO", "PROMPTPAY", "BANK_SLIP", "CODE"];
  for (let i = 0; i < 25; i++) {
    const u = allUsers[i % allUsers.length];
    await prisma.topup.create({
      data: {
        userId: u.id,
        amount: [10, 20, 50, 100, 200, 500][i % 6],
        method: methods[i % methods.length],
        reference: `ref_${Math.random().toString(36).slice(2, 10)}`,
        status: i % 8 === 0 ? "PENDING" : "SUCCESS",
        createdAt: minsAgo(i * 55 + 12),
      },
    });
  }

  // ===== Redeem codes =====
  await prisma.redeemCode.createMany({
    data: [
      { code: "OHAYO200", amount: 200, maxUses: 20, usedCount: 1, isActive: true },
      { code: "WELCOME50", amount: 50, maxUses: 100, usedCount: 34, isActive: true },
      { code: "KITTY100", amount: 100, maxUses: 10, usedCount: 10, isActive: false, expiresAt: daysAgo(2) },
    ],
  });

  // ===== FAQ =====
  await prisma.faq.createMany({
    data: [
      { question: "สั่งซื้อสินค้าอย่างไร?", answer: "เติมเงินเข้าระบบ แล้วกดซื้อสินค้าที่ต้องการ ระบบจะหักยอดและส่งไอเทมให้อัตโนมัติ", sortOrder: 1 },
      { question: "เติมเงินด้วยอั่งเปา TrueMoney ได้ไหม?", answer: "ได้ครับ ไปที่หน้าเติมเงิน วางลิงก์อั่งเปา แล้วกดเติมเงิน ระบบขึ้นเงินให้ทันที", sortOrder: 2 },
      { question: "สินค้าส่งช้าไหม?", answer: "ส่งอัตโนมัติทันทีหลังชำระเงินสำเร็จ สำหรับสินค้าที่มีสต็อกพร้อมส่ง", sortOrder: 3 },
      { question: "หากมีปัญหาติดต่อได้ที่ไหน?", answer: "ทักได้ที่ Discord ของร้าน หรือหน้าติดต่อเรา ทีมงานดูแลทุกออเดอร์", sortOrder: 4 },
    ],
  });

  // ===== Minigame =====
  const game = await prisma.minigame.create({
    data: {
      name: "เกมสุ่มรางวัล O-Hayo",
      description: "หมุนวงล้อลุ้นรางวัลสุดคิ้วท์ ทั้งเครดิต แต้ม และไอเทม!",
      imageUrl: "/assets/minigame.svg",
      priceBaht: 20,
      usePoints: false,
      sortOrder: 1,
      isActive: true,
      prizes: {
        create: [
          { name: "เครดิต 100 บาท", probability: 0.05, rewardType: "balance", rewardValue: "100" },
          { name: "เครดิต 50 บาท", probability: 0.1, rewardType: "balance", rewardValue: "50" },
          { name: "แต้ม 200", probability: 0.15, rewardType: "points", rewardValue: "200" },
          { name: "เครดิต 20 บาท", probability: 0.2, rewardType: "balance", rewardValue: "20" },
          { name: "แต้ม 50", probability: 0.25, rewardType: "points", rewardValue: "50" },
          { name: "ไม่ได้รางวัล", probability: 0.25, rewardType: "points", rewardValue: "0" },
        ],
      },
    },
    include: { prizes: true },
  });

  // plays history
  for (let i = 0; i < 12; i++) {
    const u = allUsers[i % allUsers.length];
    const won = i % 3 !== 0;
    await prisma.minigamePlay.create({
      data: {
        minigameId: game.id,
        userId: u.id,
        won,
        prizeName: won ? game.prizes[i % game.prizes.length].name : null,
        createdAt: minsAgo(i * 80 + 20),
      },
    });
  }

  // ===== Site settings singleton =====
  await prisma.siteSettings.create({
    data: { id: "singleton", json: JSON.stringify(DEFAULT_SETTINGS) },
  });

  console.log("✅ seed เสร็จสิ้น!");
  console.log(`   - ผู้ใช้: ${allUsers.length + 1} (แอดมิน: ${adminEmail})`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`   ⚠️  รหัสแอดมินที่สุ่มให้: ${adminPassword}  (บันทึกไว้แล้วเปลี่ยนภายหลัง)`);
  }
  console.log(`   - หมวดหมู่: 3, สินค้า: ${products.length}`);
  console.log(`   - ออเดอร์: 30, เติมเงิน: 25, โค้ด: 3, มินิเกม: 1`);
}

main()
  .catch((e) => {
    console.error("❌ seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
