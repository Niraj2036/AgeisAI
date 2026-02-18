import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-charcoal-900",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500/90 text-slate-950 hover:bg-emerald-400 shadow-glow-green",
        secondary:
          "bg-charcoal-800 text-slate-100 hover:bg-charcoal-700 border border-border/70",
        ghost:
          "bg-transparent text-slate-300 hover:bg-charcoal-800 hover:text-slate-50",
        outline:
          "border border-border/70 bg-charcoal-900/60 text-slate-100 hover:bg-charcoal-800/80",
        destructive:
          "bg-red-500/90 text-white hover:bg-red-400 shadow-glow-red",
        subtle:
          "bg-slate-800/80 text-slate-100 hover:bg-slate-700/80 border border-border/50"
      },
      size: {
        default: "h-9 px-3 py-1.5",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-10 px-4 text-sm",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

