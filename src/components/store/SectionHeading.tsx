import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 place-items-center rounded-2xl bg-primary-gradient text-white shadow-kawaii">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
