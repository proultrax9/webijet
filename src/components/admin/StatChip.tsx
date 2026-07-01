import { cn } from "@/lib/utils";

// ชิปสถิติเล็ก (แถบ stats ในหน้า orders/claims/minigame history)
const TONES = {
  default: "bg-white text-foreground border-primary/10",
  pink: "bg-primary/10 text-primary border-primary/20",
  blue: "bg-secondary/10 text-secondary border-secondary/20",
  green: "bg-success/10 text-success border-success/20",
  amber: "bg-amber-100 text-amber-600 border-amber-200",
  red: "bg-danger/10 text-danger border-danger/20",
} as const;

export function StatChip({
  label,
  value,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border px-4 py-3 shadow-sm", TONES[tone], className)}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-0.5 text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString("th-TH") : value}
      </p>
    </div>
  );
}
