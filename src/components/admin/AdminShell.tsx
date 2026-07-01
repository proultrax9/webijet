"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* desktop sidebar */}
      <aside className="glass-panel fixed inset-y-0 left-0 z-30 hidden w-64 border-r shadow-soft lg:block">
        <Sidebar />
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="glass-panel absolute inset-y-0 left-0 w-64 animate-pop shadow-kawaii">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* mobile top bar */}
      <div className="glass-panel sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="grid size-9 place-items-center rounded-xl bg-accent text-primary"
        >
          <Menu className="size-5" />
        </button>
        <span className="inline-flex items-center rounded-lg bg-primary-gradient px-2 py-0.5 text-sm font-extrabold text-white">
          O-Hayo
        </span>
        <span className="text-sm font-semibold text-muted-foreground">Admin</span>
      </div>

      {/* content */}
      <div className={cn("lg:pl-64")}>
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8 md:py-8">{children}</div>
      </div>
    </>
  );
}
