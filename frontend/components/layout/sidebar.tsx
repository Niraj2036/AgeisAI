"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Bot,
  ShieldAlert,
  Bell,
  ListTree,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "./../../utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/ml-monitoring", label: "ML Monitoring", icon: Activity },
  { href: "/llm-monitoring", label: "LLM Monitoring", icon: Bot },
  { href: "/risk-engine", label: "Risk Engine", icon: ShieldAlert },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/audit-logs", label: "Audit Logs", icon: ListTree },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "glass-panel relative z-30 flex h-full flex-col border-r border-border/60 bg-charcoal-900/90",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 shadow-glow-green" />
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-100">
                AegisBank AI
              </p>
            </div>
          )}
        </div>
        <button
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-charcoal-800/80 text-slate-300 hover:bg-charcoal-700"
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-emerald-500/20 to-sky-500/10 text-emerald-300"
                  : "text-slate-300 hover:bg-charcoal-800 hover:text-slate-50"
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-charcoal-800/70 text-slate-300 group-hover:bg-charcoal-700 group-hover:text-emerald-300">
                <Icon size={18} />
              </span>
              {!collapsed && (
                <span className="ml-3 whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3 text-[11px] text-slate-500">
        {!collapsed ? (
          <>
            <p className="font-medium text-slate-300">Model Fleet</p>
            <p>7 models live · 2 retraining</p>
          </>
        ) : (
          <p className="text-center">v1.0</p>
        )}
      </div>
    </aside>
  );
}

