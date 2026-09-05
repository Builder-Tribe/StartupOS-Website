"use client";

import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        // variants
        variant === "primary" && "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]",
        variant === "secondary" && "bg-zinc-900 text-white hover:bg-zinc-700 active:scale-[0.98]",
        variant === "ghost" && "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200",
        variant === "outline" && "border border-zinc-200 text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100",
        variant === "destructive" && "bg-red-500 text-white hover:bg-red-600",
        // sizes
        size === "sm" && "h-8 px-3 text-sm rounded-lg",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        size === "icon" && "h-10 w-10 p-0",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        children
      )}
    </Comp>
  );
}
