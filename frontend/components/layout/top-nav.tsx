"use client";

import { usePathname } from "next/navigation";
import { Bell, PauseCircle, PlayCircle, ShieldCheck } from "lucide-react";
import { useAlertsPanelStore } from "../../hooks/use-alerts-panel-store";
import { cn } from "../../utils/cn";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/ml-monitoring": "ML Monitoring",
  "/llm-monitoring": "LLM Monitoring",
  "/risk-engine": "Risk Engine",
  "/alerts": "Alert Center",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings"
};

export function TopNav() {
  const pathname = usePathname();
  const openAlerts = useAlertsPanelStore((s) => s.open);

  const title =
    TITLES[pathname] ||
    Object.entries(TITLES).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ||
    "Overview";

  return (
    <header className="glass-panel flex h-16 items-center justify-between border-b border-border/60 px-4 lg:px-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Quantum Bank · AI Governance
        </p>
        <h1 className="text-lg font-semibold text-slate-50">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1 rounded-full bg-charcoal-800/80 px-2 py-1 text-xs text-slate-300 md:flex">
          <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-glow-green" />
          <span className="font-medium text-emerald-300">Live</span>
          <span className="text-slate-500">·</span>
          <span>Latency median 112 ms</span>
        </div>

        <button
          className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
        >
          <ShieldCheck size={14} />
          Guardrails On
        </button>

        <button
          onClick={openAlerts}
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-charcoal-800/80 text-slate-200 hover:bg-charcoal-700"
          )}
        >
          <Bell size={16} />
          <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white shadow-glow-red">
            5
          </span>
        </button>

        <button className="hidden items-center gap-1 rounded-md border border-border/70 bg-charcoal-800/80 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-charcoal-700 lg:inline-flex">
          <PauseCircle size={14} className="text-amber-400" />
          Global Throttle
        </button>

        <button className="hidden items-center gap-1 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 lg:inline-flex">
          <PlayCircle size={14} />
          Run Smoke Tests
        </button>
      </div>
    </header>
  );
}

