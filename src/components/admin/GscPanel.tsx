"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Copy, CheckCircle2, Globe } from "lucide-react";
import type { SiteSettingsData } from "@/lib/settings";
import { getSiteBaseUrl } from "@/lib/theme-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function GscPanel({
  gsc,
  onChange,
  onSave,
  saving,
}: {
  gsc: SiteSettingsData["gsc"];
  onChange: (gsc: SiteSettingsData["gsc"]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const baseUrl = getSiteBaseUrl(gsc.propertyUrl);
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const robotsUrl = `${baseUrl}/robots.txt`;

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setStatus("คัดลอกแล้ว");
    setTimeout(() => setStatus(null), 2000);
  }

  async function checkConnection() {
    setChecking(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/gsc/status");
      const data = await res.json();
      if (data.ok) {
        setStatus(data.message);
        router.refresh();
      } else {
        setStatus(data.error ?? "ตรวจสอบไม่สำเร็จ");
      }
    } catch {
      setStatus("เกิดข้อผิดพลาด");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="size-5" />
            Google Search Console (GSC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="text-sm font-medium">เปิดใช้งาน GSC</p>
              <p className="text-xs text-muted-foreground">ฝัง meta verification + sitemap อัตโนมัติ</p>
            </div>
            <Switch
              checked={gsc.enabled}
              onCheckedChange={(v) => onChange({ ...gsc, enabled: v })}
            />
          </label>

          <div>
            <Label>URL เว็บไซต์ (Property URL)</Label>
            <Input
              value={gsc.propertyUrl}
              onChange={(e) => onChange({ ...gsc, propertyUrl: e.target.value })}
              placeholder="https://yourdomain.com"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              ใช้ URL เดียวกับที่ลงทะเบียนใน Google Search Console
            </p>
          </div>

          <div>
            <Label>Google Site Verification Code</Label>
            <Input
              value={gsc.verificationCode}
              onChange={(e) => onChange({ ...gsc, verificationCode: e.target.value })}
              placeholder="abc123xyz..."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              คัดลอกจาก GSC → Settings → Ownership verification → HTML tag (content=&quot;...&quot;)
            </p>
          </div>

          {gsc.verificationCode && (
            <div className="rounded-xl border bg-muted/30 p-3 text-xs font-mono break-all">
              {`<meta name="google-site-verification" content="${gsc.verificationCode}" />`}
            </div>
          )}

          <label className="flex items-center justify-between rounded-xl border p-3">
            <span className="text-sm font-medium">เปิด Sitemap อัตโนมัติ</span>
            <Switch
              checked={gsc.sitemapEnabled}
              onCheckedChange={(v) => onChange({ ...gsc, sitemapEnabled: v })}
            />
          </label>

          <div>
            <Label>บันทึก / หมายเหตุ</Label>
            <Textarea
              value={gsc.notes}
              onChange={(e) => onChange({ ...gsc, notes: e.target.value })}
              placeholder="วันที่ submit sitemap, ผู้ดูแล ฯลฯ"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSave} disabled={saving}>
              บันทึกการตั้งค่า GSC
            </Button>
            <Button variant="outline" onClick={checkConnection} disabled={checking}>
              ตรวจสอบการเชื่อมต่อ
            </Button>
          </div>

          {status && (
            <p className="text-sm text-success">{status}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ลิงก์สำหรับ Submit ใน GSC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Sitemap</p>
              <p className="font-mono text-sm">{sitemapUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(sitemapUrl)}>
                <Copy className="size-4" />
                คัดลอก
              </Button>
              <a href={sitemapUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="size-4" />
                  เปิด
                </Button>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
            <div>
              <p className="text-xs text-muted-foreground">robots.txt</p>
              <p className="font-mono text-sm">{robotsUrl}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => copy(robotsUrl)}>
              <Copy className="size-4" />
              คัดลอก
            </Button>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="mb-2 font-semibold text-primary">ขั้นตอนเชื่อมต่อ GSC</p>
            <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
              <li>เปิด <a className="text-primary underline" href="https://search.google.com/search-console" target="_blank" rel="noreferrer">Google Search Console</a></li>
              <li>เพิ่ม Property → ใส่ URL เว็บไซต์</li>
              <li>เลือกวิธี Verification แบบ HTML tag → คัดลอก content มาใส่ด้านบน</li>
              <li>บันทึก → กด Verify ใน GSC</li>
              <li>ไป Sitemaps → Submit URL sitemap ด้านบน</li>
            </ol>
          </div>

          {gsc.enabled && gsc.verificationCode ? (
            <Badge variant="successSoft" className="gap-1">
              <CheckCircle2 className="size-3.5" />
              พร้อม Verify — meta tag จะถูกฝังในหน้าเว็บอัตโนมัติ
            </Badge>
          ) : (
            <Badge variant="muted">ยังไม่ได้ตั้งค่า verification</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
