import Link from "next/link";
import { Heart, MessageCircle, Package, Wallet } from "lucide-react";

export function Footer({
  siteName = "OHayo Shop",
  discordLink = "#",
  footerLogoUrl,
}: {
  siteName?: string;
  discordLink?: string;
  footerLogoUrl?: string;
}) {
  return (
    <footer className="glass-panel mt-16 border-t">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          {footerLogoUrl ? (
            <img src={footerLogoUrl} alt={siteName} className="h-10 object-contain" />
          ) : (
            <span className="inline-flex items-center rounded-2xl bg-primary-gradient px-3 py-1.5 text-lg font-extrabold text-white shadow-kawaii">
              O-Hayo
            </span>
          )}
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {siteName} — จำหน่าย ID Roblox และ Item แบบครบวงจร ปลอดภัย เชื่อถือได้ 100% ส่งไว ทันใจ ดูแลทุกออเดอร์ 🎀
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-primary">เมนู</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-primary inline-flex items-center gap-1.5"><Package className="size-3.5" /> สินค้าทั้งหมด</Link></li>
            <li><Link href="/topup" className="hover:text-primary inline-flex items-center gap-1.5"><Wallet className="size-3.5" /> เติมเงิน</Link></li>
            <li><Link href="/minigame" className="hover:text-primary">มินิเกม</Link></li>
            <li><Link href="/faq" className="hover:text-primary">คำถามที่พบบ่อย</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-primary">ติดต่อ</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={discordLink} className="inline-flex items-center gap-1.5 hover:text-primary">
                <MessageCircle className="size-3.5" /> Discord
              </a>
            </li>
            <li><Link href="/contact" className="hover:text-primary">ติดต่อเรา</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/60 py-4">
        <p className="container flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteName} · made with <Heart className="size-3 fill-primary text-primary" /> by O-Hayo
        </p>
      </div>
    </footer>
  );
}
