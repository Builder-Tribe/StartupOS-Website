import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "muted" | "success" | "warning" | "info" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        variant === "default"  && "bg-zinc-100 text-zinc-700",
        variant === "brand"    && "bg-brand-50 text-brand-700",
        variant === "muted"    && "bg-zinc-100 text-zinc-500",
        variant === "success"  && "bg-emerald-50 text-emerald-700",
        variant === "warning"  && "bg-amber-50 text-amber-700",
        variant === "info"     && "bg-blue-50 text-blue-700",
        variant === "outline"  && "border border-zinc-200 text-zinc-700 bg-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
