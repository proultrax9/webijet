import type { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function StoreStatCard({
  label,
  value,
  unit,
  icon: Icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-card p-6 shadow-soft">
      {/* ไอคอนจางด้านขวา */}
      <Icon className="pointer-events-none absolute -right-2 top-1/2 size-24 -translate-y-1/2 text-primary/10" />

      <div className="relative">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-primary">{formatNumber(value)}</span>
          <span className="text-sm font-medium text-muted-foreground">{unit}</span>
        </p>
      </div>
    </div>
  );
}
