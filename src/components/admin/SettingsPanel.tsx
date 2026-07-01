"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, RefreshCw, Check } from "lucide-react";
import type { SiteSettingsData } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { FaqManager } from "@/components/admin/FaqManager";
import { GscPanel } from "@/components/admin/GscPanel";
import { FONT_MAP } from "@/lib/theme-utils";

const TAB_KEYS = [
  { id: "general", label: "รายละเอียดเว็บ" },
  { id: "meta", label: "Meta" },
  { id: "gsc", label: "GSC" },
  { id: "discord", label: "Discord" },
  { id: "banners", label: "Banner" },
  { id: "branding", label: "โลโก้ & พื้นหลัง" },
  { id: "nav", label: "ปุ่มนำทาง" },
  { id: "ad", label: "Ad Banner" },
  { id: "font", label: "ฟอนต์" },
  { id: "theme", label: "ธีมสี" },
  { id: "payment", label: "PromptPay & ธนาคาร" },
  { id: "points", label: "ระบบแต้ม" },
  { id: "sound", label: "เสียงพื้นหลัง" },
  { id: "fake", label: "ข้อมูลปลอม" },
  { id: "custom", label: "Custom Component" },
  { id: "faq", label: "FAQ" },
] as const;

export function SettingsPanel({
  initial,
  faqs = [],
}: {
  initial: SiteSettingsData;
  faqs?: { id: string; question: string; answer: string; sortOrder: number; isActive: boolean }[];
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(partial: Partial<SiteSettingsData>) {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.settings);
        setMsg("บันทึกสำเร็จ");
        router.refresh();
      } else {
        setMsg(json.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch {
      setMsg("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={<Settings className="size-6" />}
        title="จัดการการตั้งค่า"
        subtitle="จัดการการตั้งค่าเว็บไซต์และธีม"
        actions={
          <Button variant="outline" onClick={() => router.refresh()}>
            <RefreshCw className="size-4" />
            รีเฟรชข้อมูล
          </Button>
        }
      />

      {msg && (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          {msg}
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList className="mb-4 flex-wrap">
          {TAB_KEYS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดเว็บไซต์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>เบอร์โทรศัพท์เจ้าของ</Label>
                  <Input
                    value={data.general.ownerPhone}
                    onChange={(e) =>
                      setData({ ...data, general: { ...data.general, ownerPhone: e.target.value } })
                    }
                  />
                </div>
                <div>
                  <Label>ชื่อเว็บไซต์</Label>
                  <Input
                    value={data.general.siteName}
                    onChange={(e) =>
                      setData({ ...data, general: { ...data.general, siteName: e.target.value } })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>ประกาศ</Label>
                <Textarea
                  value={data.general.announcement}
                  onChange={(e) =>
                    setData({ ...data, general: { ...data.general, announcement: e.target.value } })
                  }
                />
              </div>
              <div>
                <Label>หัวข้อสินค้าแนะนำ</Label>
                <Input
                  value={data.general.featuredTitle}
                  onChange={(e) =>
                    setData({ ...data, general: { ...data.general, featuredTitle: e.target.value } })
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["recentPurchases", "ระบบแสดงรายการซื้อล่าสุด"],
                    ["reviews", "ระบบรีวิว"],
                    ["claims", "ระบบเคลมสินค้า"],
                    ["announcementBar", "แถบประกาศด้านบน"],
                    ["statusPage", "หน้าสถานะโปรแกรม"],
                    ["sortFeaturedByPrice", "เรียงสินค้าแนะนำตามราคา"],
                    ["chat", "ระบบแชท"],
                    ["statUsers", "การ์ดผู้ใช้งาน"],
                    ["statStock", "การ์ดสต็อก"],
                    ["statTopup", "การ์ดยอดขาย"],
                  ] as const
                ).map(([key, label]) => {
                  const checked = data.general.toggles[key as keyof typeof data.general.toggles];
                  return (
                    <label key={key} className="flex items-center justify-between rounded-xl border p-3">
                      <span className="text-sm font-medium">{label}</span>
                      <Switch
                        checked={!!checked}
                        onCheckedChange={(v) => {
                          setData({
                            ...data,
                            general: {
                              ...data.general,
                              toggles: { ...data.general.toggles, [key]: v },
                            },
                          });
                        }}
                      />
                    </label>
                  );
                })}
              </div>
              <Button onClick={() => save({ general: data.general })} disabled={saving}>
                <Check className="size-4" />
                บันทึกรายละเอียดเว็บ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <CardTitle>Meta Tags สำหรับ SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={data.meta.title}
                  onChange={(e) => setData({ ...data, meta: { ...data.meta, title: e.target.value } })}
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={data.meta.description}
                  onChange={(e) =>
                    setData({ ...data, meta: { ...data.meta, description: e.target.value } })
                  }
                />
              </div>
              <div>
                <Label>Meta Keywords (คั่นด้วย comma)</Label>
                <Input
                  value={data.meta.keywords}
                  onChange={(e) =>
                    setData({ ...data, meta: { ...data.meta, keywords: e.target.value } })
                  }
                />
              </div>
              <div>
                <Label>Meta Photo / OG Image URL</Label>
                <Input
                  value={data.meta.photoUrl}
                  onChange={(e) =>
                    setData({ ...data, meta: { ...data.meta, photoUrl: e.target.value } })
                  }
                  placeholder="/assets/og-image.svg"
                />
              </div>
              <Button onClick={() => save({ meta: data.meta })} disabled={saving}>
                บันทึก Meta Tags
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gsc">
          <GscPanel
            gsc={data.gsc}
            onChange={(gsc) => setData({ ...data, gsc })}
            onSave={() => save({ gsc: data.gsc })}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="discord">
          <Card>
            <CardHeader>
              <CardTitle>Discord</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Discord Link</Label>
                <Input
                  value={data.discord.inviteLink}
                  onChange={(e) =>
                    setData({ ...data, discord: { ...data.discord, inviteLink: e.target.value } })
                  }
                />
              </div>
              <div>
                <Label>Webhook เติมเงิน</Label>
                <Input
                  value={data.discord.webhooks.topup}
                  onChange={(e) =>
                    setData({
                      ...data,
                      discord: {
                        ...data.discord,
                        webhooks: { ...data.discord.webhooks, topup: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <Button onClick={() => save({ discord: data.discord })} disabled={saving}>
                บันทึกการตั้งค่า Discord
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <CardTitle>Banner หน้าแรก (1–3)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.banners.map((url, i) => (
                <div key={i}>
                  <Label>Banner {i + 1} URL</Label>
                  <Input
                    value={url}
                    onChange={(e) => {
                      const banners = [...data.banners];
                      banners[i] = e.target.value;
                      setData({ ...data, banners });
                    }}
                    placeholder="/assets/hero-banner.svg"
                  />
                </div>
              ))}
              <Button onClick={() => save({ banners: data.banners })} disabled={saving}>
                บันทึก Banner
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>โลโก้ & พื้นหลัง</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {(
                [
                  ["logoUrl", "โลโก้หลัก"],
                  ["loadingLogoUrl", "โลโก้ Loading"],
                  ["footerLogoUrl", "โลโก้ Footer"],
                  ["backgroundUrl", "รูปพื้นหลัง"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    value={data.branding[key]}
                    onChange={(e) =>
                      setData({
                        ...data,
                        branding: { ...data.branding, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
              <div>
                <Label>
                  ความชัดของรูปพื้นหลัง — {Math.round((data.branding.backgroundOpacity ?? 0) * 100)}%
                </Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={Math.max(0, Math.min(1, data.branding.backgroundOpacity ?? 0))}
                  onChange={(e) =>
                    setData({
                      ...data,
                      branding: {
                        ...data.branding,
                        backgroundOpacity: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-2 w-full accent-primary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  0% = ซ่อนรูป (เห็นเฉพาะสีพื้น) · 100% = เห็นรูปเต็ม · ใช้เมื่อตั้ง &quot;รูปพื้นหลัง&quot; ไว้
                </p>
              </div>
              <div className="md:col-span-2">
                <Label>
                  ความโปร่งใส Panel UI — ระดับ {data.branding.panelTransparency ?? 7} / 10
                </Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={data.branding.panelTransparency ?? 7}
                  onChange={(e) =>
                    setData({
                      ...data,
                      branding: {
                        ...data.branding,
                        panelTransparency: Number(e.target.value),
                      },
                    })
                  }
                  className="mt-2 w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>1 — ทึบ</span>
                  <span>10 — โปร่งใสสุด</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ใช้กับ Sidebar, การ์ด, Navbar ทั้งหน้าร้านและ Admin
                </p>
              </div>
              <div className="md:col-span-2">
                <Button onClick={() => save({ branding: data.branding })} disabled={saving}>
                  บันทึกโลโก้ & พื้นหลัง
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nav">
          <Card>
            <CardHeader>
              <CardTitle>ปุ่มนำทาง (4 ปุ่ม)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.navButtons.map((btn, i) => (
                <div key={i} className="grid gap-3 rounded-xl border p-3 md:grid-cols-2">
                  <div>
                    <Label>ปุ่ม {i + 1} — รูป URL</Label>
                    <Input
                      value={btn.imageUrl}
                      onChange={(e) => {
                        const navButtons = [...data.navButtons];
                        navButtons[i] = { ...navButtons[i], imageUrl: e.target.value };
                        setData({ ...data, navButtons });
                      }}
                    />
                  </div>
                  <div>
                    <Label>ลิงก์ปลายทาง</Label>
                    <Input
                      value={btn.link}
                      onChange={(e) => {
                        const navButtons = [...data.navButtons];
                        navButtons[i] = { ...navButtons[i], link: e.target.value };
                        setData({ ...data, navButtons });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button onClick={() => save({ navButtons: data.navButtons })} disabled={saving}>
                บันทึกปุ่มนำทาง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ad">
          <Card>
            <CardHeader>
              <CardTitle>Ad Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>รูปภาพหรือ HTML Code</Label>
                <Textarea
                  value={data.adBanner.imageOrHtml}
                  onChange={(e) =>
                    setData({
                      ...data,
                      adBanner: { ...data.adBanner, imageOrHtml: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Drop Shadow (0–1)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={data.adBanner.dropShadow}
                  onChange={(e) =>
                    setData({
                      ...data,
                      adBanner: { ...data.adBanner, dropShadow: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <Button onClick={() => save({ adBanner: data.adBanner })} disabled={saving}>
                บันทึก Ad Banner
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="font">
          <Card>
            <CardHeader>
              <CardTitle>ฟอนต์เว็บไซต์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>เลือกฟอนต์</Label>
                <Select
                  value={data.font}
                  onChange={(e) =>
                    setData({ ...data, font: e.target.value as SiteSettingsData["font"] })
                  }
                >
                  {(Object.keys(FONT_MAP) as SiteSettingsData["font"][]).map((key) => (
                    <option key={key} value={key}>
                      {FONT_MAP[key].label}
                    </option>
                  ))}
                </Select>
              </div>
              <p
                className="rounded-xl border bg-muted/30 p-4 text-base"
                style={{ fontFamily: FONT_MAP[data.font]?.previewFamily }}
              >
                ตัวอย่าง: OHayo Shop — จำหน่าย ID Roblox และ Item แบบครบวงจร 🎀
                <br />
                <span className="text-sm text-muted-foreground">
                  ก ข ค ง จ ฉ ช ซ ญ ด ต ถ ท ธ น บ ป ผ ฝ พ ฟ ภ ม ย ร ล ว ศ ษ ส ห ฬ อ ฮ 0123456789
                </span>
              </p>
              <Button onClick={() => save({ font: data.font })} disabled={saving}>
                บันทึกฟอนต์
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>PromptPay & ธนาคาร</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>เบอร์ PromptPay</Label>
                <Input
                  value={data.payment.promptpayNumber}
                  onChange={(e) =>
                    setData({ ...data, payment: { ...data.payment, promptpayNumber: e.target.value } })
                  }
                />
              </div>
              <div>
                <Label>ชื่อบัญชี</Label>
                <Input
                  value={data.payment.bankAccountName}
                  onChange={(e) =>
                    setData({ ...data, payment: { ...data.payment, bankAccountName: e.target.value } })
                  }
                />
              </div>
              <div>
                <Label>ธนาคาร</Label>
                <Input
                  value={data.payment.bankName}
                  onChange={(e) =>
                    setData({ ...data, payment: { ...data.payment, bankName: e.target.value } })
                  }
                />
              </div>
              <div>
                <Label>เลขบัญชี</Label>
                <Input
                  value={data.payment.bankAccountNumber}
                  onChange={(e) =>
                    setData({ ...data, payment: { ...data.payment, bankAccountNumber: e.target.value } })
                  }
                />
              </div>
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span>เปิด PromptPay</span>
                <Switch
                  checked={data.payment.enablePromptpay}
                  onCheckedChange={(v) =>
                    setData({ ...data, payment: { ...data.payment, enablePromptpay: v } })
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span>เปิดอัปโหลดสลิป</span>
                <Switch
                  checked={data.payment.enableSlipUpload}
                  onCheckedChange={(v) =>
                    setData({ ...data, payment: { ...data.payment, enableSlipUpload: v } })
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span>เปิด TrueMoney อั่งเปา</span>
                <Switch
                  checked={data.payment.enableAngpao}
                  onCheckedChange={(v) =>
                    setData({ ...data, payment: { ...data.payment, enableAngpao: v } })
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span>ซื้อแบบ Guest (ไม่ต้องล็อกอิน)</span>
                <Switch
                  checked={data.payment.enableGuestPurchase}
                  onCheckedChange={(v) =>
                    setData({ ...data, payment: { ...data.payment, enableGuestPurchase: v } })
                  }
                />
              </label>
              <Button onClick={() => save({ payment: data.payment })} disabled={saving}>
                บันทึกการชำระเงิน
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>ธีมสี</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {(
                [
                  ["primary", "สีหลัก"],
                  ["secondary", "สีรอง"],
                  ["background", "สีพื้นหลัง"],
                  ["text", "สีข้อความ"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="color"
                    value={data.theme[key]}
                    onChange={(e) =>
                      setData({ ...data, theme: { ...data.theme, [key]: e.target.value } })
                    }
                  />
                </div>
              ))}
              <div>
                <Label>Particle Effect</Label>
                <Select
                  value={data.theme.particle}
                  onChange={(e) =>
                    setData({
                      ...data,
                      theme: { ...data.theme, particle: e.target.value as SiteSettingsData["theme"]["particle"] },
                    })
                  }
                >
                  <option value="HELLOKITTY">Hello Kitty</option>
                  <option value="HEARTS">Hearts</option>
                  <option value="STARS">Stars</option>
                  <option value="NONE">None</option>
                </Select>
              </div>
              <div>
                <Label>ความเข้ม particle &amp; พื้นหลัง (0–1)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={data.theme.opacity}
                  onChange={(e) =>
                    setData({
                      ...data,
                      theme: { ...data.theme, opacity: Number(e.target.value) },
                    })
                  }
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  ค่า 1 = เข้มสุด · 0.5 = ปานกลาง · ใช้กับไอคอนลอยและ gradient พื้นหลัง
                </p>
              </div>
              <div className="md:col-span-2">
                <Button onClick={() => save({ theme: data.theme })} disabled={saving}>
                  บันทึกการตั้งค่าธีม
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fake">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลปลอม (Social Proof)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>ผู้ใช้ปลอม</Label>
                <Input
                  type="number"
                  value={data.fakeData.fakeUsers}
                  onChange={(e) =>
                    setData({
                      ...data,
                      fakeData: { ...data.fakeData, fakeUsers: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div>
                <Label>เติมเงินปลอม</Label>
                <Input
                  type="number"
                  value={data.fakeData.fakeTopupCount}
                  onChange={(e) =>
                    setData({
                      ...data,
                      fakeData: { ...data.fakeData, fakeTopupCount: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div>
                <Label>ยอดขายปลอม</Label>
                <Input
                  type="number"
                  value={data.fakeData.fakeSellCount}
                  onChange={(e) =>
                    setData({
                      ...data,
                      fakeData: { ...data.fakeData, fakeSellCount: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="md:col-span-3">
                <Button onClick={() => save({ fakeData: data.fakeData })} disabled={saving}>
                  บันทึกข้อมูลปลอม
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>ระบบแต้ม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span>แต้มจากเติมเงิน</span>
                <Switch
                  checked={data.points.fromTopup}
                  onCheckedChange={(v) =>
                    setData({ ...data, points: { ...data.points, fromTopup: v } })
                  }
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span>แต้มจากรีวิว</span>
                <Switch
                  checked={data.points.fromReview}
                  onCheckedChange={(v) =>
                    setData({ ...data, points: { ...data.points, fromReview: v } })
                  }
                />
              </label>
              <Button onClick={() => save({ points: data.points })} disabled={saving}>
                บันทึกระบบแต้ม
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sound">
          <Card>
            <CardHeader>
              <CardTitle>เสียงพื้นหลัง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span>Welcome Page BGM</span>
                <Switch
                  checked={data.sound.welcomePage}
                  onCheckedChange={(v) =>
                    setData({ ...data, sound: { ...data.sound, welcomePage: v } })
                  }
                />
              </label>
              <div>
                <Label>Music URL (.mp3 / .wav / .ogg)</Label>
                <Input
                  value={data.sound.musicUrl}
                  onChange={(e) =>
                    setData({ ...data, sound: { ...data.sound, musicUrl: e.target.value } })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Volume (0–1)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={data.sound.volume}
                  onChange={(e) =>
                    setData({ ...data, sound: { ...data.sound, volume: Number(e.target.value) } })
                  }
                />
              </div>
              <Button onClick={() => save({ sound: data.sound })} disabled={saving}>
                บันทึกเสียงพื้นหลัง
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Component (HTML/CSS)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>HTML Snippet</Label>
                <Textarea
                  rows={6}
                  value={data.customComponents[0]?.html ?? ""}
                  onChange={(e) => {
                    const customComponents = data.customComponents.length
                      ? [...data.customComponents]
                      : [{ html: "", sortOrder: 0, isActive: true }];
                    customComponents[0] = { ...customComponents[0], html: e.target.value };
                    setData({ ...data, customComponents });
                  }}
                  placeholder="<div>...</div>"
                />
              </div>
              <label className="flex items-center justify-between rounded-xl border p-3">
                <span className="text-sm font-medium">เปิดใช้งานบนหน้าแรก</span>
                <Switch
                  checked={data.customComponents[0]?.isActive ?? true}
                  onCheckedChange={(v) => {
                    const customComponents = data.customComponents.length
                      ? [...data.customComponents]
                      : [{ html: "", sortOrder: 0, isActive: true }];
                    customComponents[0] = { ...customComponents[0], isActive: v };
                    setData({ ...data, customComponents });
                  }}
                />
              </label>
              <Button
                onClick={() =>
                  save({
                    customComponents: data.customComponents.length
                      ? data.customComponents
                      : [{ html: "", sortOrder: 0, isActive: true }],
                  })
                }
                disabled={saving}
              >
                บันทึก Custom Component
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <FaqManager initial={faqs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
