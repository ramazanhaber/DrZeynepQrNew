"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-[var(--brand-gold)] text-slate-950 hover:bg-[#e8a60c] shadow-[0_14px_30px_rgba(245,158,11,0.28)]",
  outline:
    "border border-white/30 bg-white/10 text-white hover:bg-white/15",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800",
  ghost: "text-slate-700 hover:bg-slate-100",
  destructive: "bg-rose-600 text-white hover:bg-rose-700",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-11 px-5 py-2.5",
  sm: "h-9 rounded-xl px-3",
  lg: "h-12 rounded-2xl px-6",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
