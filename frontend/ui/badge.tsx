import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-slate-500/60 bg-slate-900/80 text-slate-200",
        success:
          "border-emerald-500/60 bg-emerald-500/15 text-emerald-300",
        warning:
          "border-amber-500/60 bg-amber-500/15 text-amber-200",
        critical:
          "border-red-500/70 bg-red-500/15 text-red-200 shadow-glow-red",
        outline:
          "border-border/70 bg-transparent text-slate-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

