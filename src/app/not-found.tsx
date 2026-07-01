import Link from "next/link";
import { Home } from "lucide-react";
import { KittyFace } from "@/components/decor/CornerMascot";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="w-40 animate-float">
        <KittyFace className="w-full drop-shadow-[0_8px_14px_rgba(255,150,200,0.4)]" />
      </div>
      <p className="mt-6 text-7xl font-extrabold gradient-text">404</p>
      <h1 className="mt-2 text-xl font-bold text-foreground/80">ไม่พบหน้านี้</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ขออภัยค่ะ หน้าที่คุณกำลังหาอาจถูกย้ายหรือไม่มีอยู่ 🎀
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-semibold text-white shadow-kawaii transition-transform hover:scale-105"
      >
        <Home className="size-4" /> กลับหน้าแรก
      </Link>
    </div>
  );
}
