# 🎀 OHayo Shop — ร้านค้าดิจิทัล ID Roblox & Item (ธีม Kawaii)

เว็บร้านขายไอดี Roblox และไอเทมในเกม (Blox Spin, Grow a Garden 2, Attack on Titan ฯลฯ)
พร้อมระบบเติมเงิน (TrueMoney อั่งเปา / PromptPay / สลิป) และ **Admin Panel ครบวงจร**
ดีไซน์สไตล์ Hello Kitty pastel pink 💗

> Prototype ที่ **รันได้จริงทันที** ด้วย SQLite — ไม่ต้องตั้งเซิร์ฟเวอร์ฐานข้อมูล
> ระบบชำระเงิน/แจ้งเตือนทำงานแบบ **จำลอง (mock)** เปลี่ยนเป็น API จริงได้ภายหลัง

---

## 🚀 เริ่มใช้งาน (3 คำสั่ง)

```bash
cd ohayo-shop
pnpm install
pnpm db:push      # สร้างตาราง SQLite
pnpm db:seed      # ใส่ข้อมูลตัวอย่าง (สินค้า/ผู้ใช้/ออเดอร์)
pnpm dev          # เปิด http://localhost:3000
```

> ใช้ `npm` หรือ `yarn` แทน `pnpm` ได้ (script ชื่อเดียวกัน)

รีเซ็ตข้อมูลใหม่ทั้งหมด: `pnpm db:reset`

---

## 🔗 หน้าเว็บหลัก

| หน้า | URL | รายละเอียด |
|------|-----|-----------|
| หน้าแรก | `/` | Hero + สถิติ + สินค้าล่าสุด + หมวดหมู่ + สินค้าแนะนำ |
| สินค้าทั้งหมด | `/products` | ค้นหา/กรองหมวด/เรียงราคา |
| รายละเอียดสินค้า | `/products/[slug]` | ซื้อเลย (หัก wallet) |
| เติมเงิน ⭐ | `/topup` | อั่งเปา / PromptPay / สลิป / โค้ด |
| ติดต่อเรา | `/contact` | Discord + FAQ |
| มินิเกม | `/minigame` | เกมสุ่มรางวัล |
| โปรไฟล์ | `/profile` | ยอดเงิน/แต้ม/ประวัติ |
| **Admin** | `/admin` | Dashboard + จัดการทั้งหมด |

**บัญชี demo:** ระบบล็อกอินอัตโนมัติเป็นผู้ใช้ตัวอย่าง (โหมด prototype)
- ผู้ใช้ทั่วไป: `lonnachai.jet2@gmail.com`
- แอดมิน (seed ไว้): `admin@ohayo.shop`

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + ชุด component แบบ shadcn (เขียนเอง) |
| Database | **SQLite** + Prisma ORM |
| Charts | Recharts (Admin Dashboard) |
| Icons | Lucide React |
| Font | Prompt (Google Fonts) |
| กราฟิก | SVG asset สไตล์ kawaii (เจนด้วย Codex) |

---

## ⚙️ ตัวแปรสภาพแวดล้อม (`.env`)

คัดลอกจาก `.env.example` — ค่าเริ่มต้นรันได้เลยในโหมดจำลอง

```env
DATABASE_URL="file:./dev.db"
TRUEMONEY_PHONE="0899999999"     # เบอร์ TrueMoney ร้าน (server-side เท่านั้น)
SLIP2GO_API_KEY=""
DISCORD_WEBHOOK_TOPUP=""
MOCK_INTEGRATIONS="true"          # true = จำลอง, false = ต่อ API จริง
```

### เชื่อม TrueMoney อั่งเปาจริง
1. `pnpm add tmn-voucher`
2. เปิดใช้ในไฟล์ `src/lib/truemoney-angpao.ts` (มี TODO ระบุจุดไว้)
3. ตั้ง `MOCK_INTEGRATIONS="false"` + ใส่ `TRUEMONEY_PHONE`

### ใช้ PostgreSQL แทน SQLite
เปลี่ยน `provider = "postgresql"` ใน `prisma/schema.prisma`, ปรับ `DATABASE_URL`,
แล้วเปลี่ยน field `String (JSON)` / `Float` กลับเป็น `Json` / `Decimal` ได้ตามสเปคเดิม

---

## 📁 โครงสร้างโปรเจกต์

```
ohayo-shop/
├── prisma/
│   ├── schema.prisma        # โมเดล DB (ปรับสำหรับ SQLite)
│   └── seed.ts              # ข้อมูลตัวอย่าง
├── public/assets/           # กราฟิก SVG kawaii (โลโก้/แบนเนอร์/สินค้า)
├── src/
│   ├── app/
│   │   ├── (store)/         # ฝั่งลูกค้า (navbar + particle + mascot)
│   │   ├── admin/           # ฝั่งแอดมิน (sidebar)
│   │   └── api/             # route handlers (topup, orders, admin)
│   ├── components/
│   │   ├── ui/              # ชุด component พื้นฐาน
│   │   ├── store/           # component ฝั่งร้าน
│   │   ├── admin/           # component ฝั่งแอดมิน
│   │   └── decor/           # particle + มาสคอต
│   └── lib/                 # prisma, settings, utils, mocks
├── .env.example
└── package.json
```

---

## ✨ ฟีเจอร์

**ฝั่งลูกค้า:** Hero banner · การ์ดสถิติ (จริง+ปลอมเพื่อ social proof) · รายการซื้อล่าสุด (mask ชื่อ) ·
หมวดหมู่แนะนำ · สินค้าแนะนำ · ค้นหา/กรอง · ซื้อหัก wallet · เติมเงิน 4 วิธี · มินิเกมสุ่มรางวัล · FAQ

**ฝั่งแอดมิน:** Dashboard (5 KPI + กราฟ Recharts + export CSV) · จัดการธุรกรรม · จัดการสินค้า/หมวดหมู่/สต็อก ·
ออเดอร์ · เคลม · โค้ดเติมเงิน · มินิเกม + ประวัติ · ผู้ใช้ · **ตั้งค่า 15 แท็บ** (บันทึกเป็น JSON)

**ระบบ toggle:** เปิด/ปิดฟีเจอร์ (รีวิว, เคลม, แชท, ประกาศ, การ์ดสถิติ, ระบบแต้ม ฯลฯ) จากหน้า Settings

---

## 📌 หมายเหตุ (โหมด Prototype)

- **Auth**: โหมด demo ล็อกอินอัตโนมัติ — โปรดักชันจริงเปลี่ยนเป็น NextAuth.js
- **การชำระเงิน/Discord/Slip2Go**: จำลองผล เพื่อให้เดโมทำงานครบ flow โดยไม่ต้องมี key จริง
- ข้อมูลทั้งหมดมาจาก DB/seed (ไม่ hardcode) แก้ได้ผ่านหน้า Admin

จาก `PROJECT-SPEC.md` — โฟกัส Phase 1–3 (Setup/Store/Topup) แบบรันได้จริง
ส่วน Phase 4–7 (delivery flow, report ขั้นสูง, real integration, polish) ต่อยอดได้จากฐานนี้
