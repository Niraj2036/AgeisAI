"use client";

import { useEffect } from "react";

export function OverviewDashboard() {
  useEffect(() => {
    // #region agent log
    fetch(
      "http://127.0.0.1:7243/ingest/b6c0ecd9-2ff2-4b11-aae2-7d7ada4d6eea",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `log_${Date.now()}_overview_dashboard`,
          runId: "pre-fix",
          hypothesisId: "H_OVERVIEW_ENTRY",
          location: "components/overview/overview-dashboard.tsx:6",
          message: "OverviewDashboard mounted",
          data: {},
          timestamp: Date.now()
        })
      }
    ).catch(() => {});
    // #endregion
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="glass-panel rounded-lg border border-emerald-500/40 bg-charcoal-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            AI Health Score
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">92</p>
          <p className="mt-1 text-xs text-slate-500">Safe · All systems nominal</p>
        </div>
        <div className="glass-panel rounded-lg border border-border/60 bg-charcoal-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Loan Approval Rate
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">64.3%</p>
          <p className="mt-1 text-xs text-slate-500">
            24h rolling window · Retail
          </p>
        </div>
        <div className="glass-panel rounded-lg border border-border/60 bg-charcoal-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Avg Portfolio Risk Score
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">0.31</p>
          <p className="mt-1 text-xs text-slate-500">
            0 = low risk, 1 = high risk
          </p>
        </div>
        <div className="glass-panel rounded-lg border border-border/60 bg-charcoal-900/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Active Alerts
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-300">5</p>
          <p className="mt-1 text-xs text-slate-500">Across ML + LLM stack</p>
        </div>
      </div>
      <div className="glass-panel h-64 rounded-lg border border-border/60 bg-charcoal-900/80 p-4 text-xs text-slate-500">
        This is a placeholder for the full AI observability overview. Once the
        core runtime issue is resolved, richer charts and controls will appear
        here.
      </div>
    </div>
  );
}

