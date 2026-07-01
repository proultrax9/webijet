import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-white/60 px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-4 grid size-16 place-items-center rounded-3xl bg-accent text-primary">
          {icon}
        </span>
      )}
      <p className="text-lg font-semibold text-foreground/80">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
