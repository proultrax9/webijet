import { cn } from "@/lib/utils";

// KPI card สไตล์ dashboard (image2) — ไอคอนชมพูมุมบน + ตัวเลขใหญ่
export function StatCard({
  label,
  value,
  unit,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white to-accent/40 p-5 shadow-soft",
        className,
      )}
    >
      <div className="mb-6 grid size-12 place-items-center rounded-2xl bg-primary-gradient text-white shadow-kawaii">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-primary">
        {typeof value === "number" ? value.toLocaleString("th-TH") : value}
      </p>
      {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
    </div>
  );
}
