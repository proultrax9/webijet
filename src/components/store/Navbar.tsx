"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Package,
  Wallet,
  Mail,
  Settings,
  Search,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Coins,
  ShoppingBag,
  Receipt,
  Ticket,
  Gamepad2,
} from "lucide-react";
import { cn, formatBaht } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";
import { Logo } from "./Logo";

const NAV = [
  { label: "หน้าแรก", href: "/", icon: Home },
  { label: "สินค้าทั้งหมด", href: "/products", icon: Package },
  { label: "เติมเงิน", href: "/topup", icon: Wallet },
  { label: "ติดต่อเรา", href: "/contact", icon: Mail },
];

const ADMIN_NAV = { label: "จัดการระบบ", href: "/admin", icon: Settings };

// เมนูในกล่องบัญชีผู้ใช้ (dropdown) — ลิงก์ไปหน้าที่มีจริงในระบบ
const ACCOUNT_MENU = [
  { label: "โปรไฟล์", href: "/profile", icon: UserIcon },
  { label: "ประวัติการซื้อ", href: "/profile#orders", icon: ShoppingBag },
  { label: "ประวัติการเติมเงิน", href: "/profile#topups", icon: Receipt },
  { label: "เติมเงิน", href: "/topup", icon: Wallet },
  { label: "กรอกโค้ดเติมเงิน", href: "/topup", icon: Ticket },
  { label: "มินิเกม", href: "/minigame", icon: Gamepad2 },
];

export function Navbar({
  user,
  siteName = "OHayo Shop",
  logoUrl,
}: {
  user: SessionUser | null;
  siteName?: string;
  logoUrl?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = user?.role === "ADMIN" ? [...NAV, ADMIN_NAV] : NAV;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="glass-panel sticky top-0 z-40 border-b shadow-sm">
      <nav className="container flex h-16 items-center gap-2">
        <Link href="/" className="mr-2 flex items-center gap-2 shrink-0">
          <Logo url={logoUrl} className="h-10 w-auto" />
          <span className="sr-only">{siteName}</span>
        </Link>

        {/* nav links */}
        <div className="hidden flex-1 items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-primary-gradient text-primary-foreground shadow-kawaii"
                    : "text-foreground/70 hover:bg-primary/10 hover:text-primary",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 lg:flex-none">
          <button className="rounded-full p-2.5 text-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary">
            <Search className="size-5" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-primary/15 bg-white py-1.5 pl-2 pr-3 shadow-sm transition-colors hover:border-primary/40"
              >
                <span className="grid size-7 place-items-center rounded-full bg-primary-gradient text-white">
                  <UserIcon className="size-4" />
                </span>
                <span className="hidden max-w-[160px] truncate text-sm font-medium sm:block">
                  {user.email}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-64 origin-top-right animate-pop rounded-2xl border border-primary/10 bg-white p-2 shadow-kawaii">
                    <div className="rounded-xl bg-accent/60 p-3">
                      <p className="truncate text-sm font-semibold">{user.username}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
                          <Wallet className="size-3.5" /> {formatBaht(user.balance)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-secondary shadow-sm">
                          <Coins className="size-3.5" /> {user.points} แต้ม
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex max-h-[60vh] flex-col overflow-y-auto">
                      {user.role === "ADMIN" && (
                        <Link
                          href={ADMIN_NAV.href}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Settings className="size-4" /> {ADMIN_NAV.label}
                        </Link>
                      )}
                      {ACCOUNT_MENU.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-primary/10"
                            onClick={() => setMenuOpen(false)}
                          >
                            <Icon className="size-4" /> {item.label}
                          </Link>
                        );
                      })}
                      <div className="my-1 border-t border-primary/10" />
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 disabled:opacity-60"
                      >
                        <LogOut className="size-4" /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary-gradient px-5 py-2 text-sm font-semibold text-white shadow-kawaii"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
