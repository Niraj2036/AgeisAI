import * as React from "react";
import { cn } from "../utils/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          props.onChange?.({
            ...((e as unknown) as React.ChangeEvent<HTMLInputElement>),
            target: {
              ...(e.target as HTMLInputElement),
              checked: !checked
            }
          });
        }}
        className={cn(
          "inline-flex h-5 w-9 items-center rounded-full border border-border/70 bg-charcoal-900/80 transition-colors",
          checked ? "bg-emerald-500/80 border-emerald-400" : "",
          className
        )}
      >
        <span
          className={cn(
            "ml-0.5 inline-block h-4 w-4 transform rounded-full bg-slate-200 shadow transition-transform",
            checked ? "translate-x-3" : ""
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

