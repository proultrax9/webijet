"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Info,
  BarChart3,
  ArrowLeftRight,
  Package,
  FolderTree,
  ShoppingBag,
  CreditCard,
  ShieldAlert,
  Star,
  MessagesSquare,
  Gamepad2,
  History,
  Users,
  Ticket,
  Settings,
  ChevronDown,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
type Group = { label: string; icon: React.ComponentType<{ className?: string }>; items: Item[] };

const GROUPS: Group[] = [
  {
    label: "ข้อมูลเว็บไซต์",
    icon: Info,
    items: [
      { label: "รายงานการเงิน & สถิติ", href: "/admin/dashboard", icon: BarChart3 },
      { label: "จัดการธุรกรรม", href: "/admin/transactions", icon: ArrowLeftRight },
    ],
  },
  {
    label: "จัดการสินค้า",
    icon: Package,
    items: [
      { label: "จัดการหมวดหมู่", href: "/admin/products?tab=categories", icon: FolderTree },
      { label: "จัดการสินค้า", href: "/admin/products", icon: Package },
      { label: "จัดการออเดอร์", href: "/admin/orders", icon: ShoppingBag },
      { label: "จัดการการผ่อน", href: "/admin/installments", icon: CreditCard },
      { label: "จัดการเคลมสินค้า", href: "/admin/claims", icon: ShieldAlert },
      { label: "จัดการรีวิว", href: "/admin/reviews", icon: Star },
      { label: "จัดการแชท", href: "/admin/chat", icon: MessagesSquare },
      { label: "จัดการมินิเกม", href: "/admin/minigames", icon: Gamepad2 },
      { label: "ประวัติการเล่นมินิเกม", href: "/admin/minigames/history", icon: History },
    ],
  },
  {
    label: "จัดการผู้ใช้",
    icon: Users,
    items: [{ label: "รายชื่อผู้ใช้", href: "/admin/users", icon: Users }],
  },
  {
    label: "จัดการโค้ด",
    icon: Ticket,
    items: [{ label: "โค้ดแลกแต้ม/เครดิต", href: "/admin/codes", icon: Ticket }],
  },
  {
    label: "การตั้งค่า",
    icon: Settings,
    items: [{ label: "ตั้งค่าเว็บไซต์", href: "/admin/settings", icon: Settings }],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    const base = href.split("?")[0];
    return pathname === base || (base !== "/admin" && pathname.startsWith(base));
  };

  // เปิด group ที่มี item active อยู่โดยอัตโนมัติ
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    GROUPS.forEach((g) => {
      init[g.label] = g.items.some((i) => isActive(i.href)) || g.label === "จัดการสินค้า";
    });
    return init;
  });

  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-4">
        <span className="inline-flex items-center rounded-xl bg-primary-gradient px-2.5 py-1 text-sm font-extrabold text-white shadow-kawaii">
          O-Hayo
        </span>
        <Link
          href="/"
          className="grid size-9 place-items-center rounded-xl bg-accent text-primary transition-colors hover:bg-primary hover:text-white"
          title="กลับหน้าร้าน"
        >
          <Home className="size-5" />
        </Link>
      </div>

      <p className="px-5 pb-2 text-center text-xs font-semibold text-muted-foreground">
        ข้อมูลเว็บไซต์
      </p>

      {/* menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = open[group.label];
          return (
            <div key={group.label}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [group.label]: !o[group.label] }))}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  group.items.some((i) => isActive(i.href))
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-primary/5",
                )}
              >
                <GroupIcon className="size-5 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                />
              </button>

              {isOpen && (
                <div className="mt-1 space-y-0.5 pl-4">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all",
                          active
                            ? "bg-primary-gradient font-semibold text-white shadow-kawaii"
                            : "text-foreground/60 hover:bg-primary/10 hover:text-primary",
                        )}
                      >
                        <ItemIcon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* footer */}
      <div className="border-t border-primary/10 px-4 py-3">
        <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
          Panel v1.0 made by vvs with <Heart className="size-3 fill-primary text-primary" />
        </p>
      </div>
    </div>
  );
}
