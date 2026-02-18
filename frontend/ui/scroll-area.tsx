import * as React from "react";
import { cn } from "../utils/cn";

export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      {...props}
    />
  )
);

ScrollArea.displayName = "ScrollArea";

