import * as React from "react";
import { cn } from "../utils/cn";

const Table = ({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="relative w-full overflow-x-auto rounded-lg border border-border/70 bg-charcoal-950/60">
    <table
      className={cn(
        "w-full border-collapse text-left text-xs text-slate-200",
        className
      )}
      {...props}
    />
  </div>
);

const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={cn(
      "bg-charcoal-900/90 text-[11px] uppercase tracking-[0.18em] text-slate-400",
      className
    )}
    {...props}
  />
);

const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("divide-y divide-border/60", className)} {...props} />
);

const TableRow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      "transition-colors hover:bg-charcoal-900/90",
      className
    )}
    {...props}
  />
);

const TableHead = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "px-4 py-2 font-medium text-[11px] text-slate-400",
      className
    )}
    {...props}
  />
);

const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn(
      "px-4 py-2 align-middle text-xs text-slate-200",
      className
    )}
    {...props}
  />
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };

