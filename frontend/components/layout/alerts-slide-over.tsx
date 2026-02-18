"use client";

import { X, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useAlertsPanelStore } from "../../hooks/use-alerts-panel-store";
import { useState } from "react";

type Severity = "low" | "medium" | "high";

interface AlertItem {
  id: string;
  severity: Severity;
  title: string;
  timestamp: string;
  suggestedAction: string;
}

const MOCK_ALERTS: AlertItem[] = [
  {
    id: "1",
    severity: "high",
    title: "Anomalous Approval Behavior Detected",
    timestamp: "2 min ago",
    suggestedAction: "Review recent approvals and consider freezing high-risk segments."
  },
  {
    id: "2",
    severity: "medium",
    title: "Rising Hallucination Rate in Chatbot",
    timestamp: "7 min ago",
    suggestedAction: "Trigger safety-focused retraining on last 24h conversations."
  },
  {
    id: "3",
    severity: "low",
    title: "Drift approaching threshold for Risk v3",
    timestamp: "18 min ago",
    suggestedAction: "Schedule offline evaluation and policy refresh."
  }
];

function severityStyles(severity: Severity) {
  switch (severity) {
    case "high":
      return {
        label: "High",
        icon: AlertTriangle,
        color: "text-red-300",
        pill: "bg-red-500/20 text-red-200 border-red-500/40"
      };
    case "medium":
      return {
        label: "Medium",
        icon: AlertCircle,
        color: "text-amber-300",
        pill: "bg-amber-500/20 text-amber-200 border-amber-500/40"
      };
    case "low":
    default:
      return {
        label: "Low",
        icon: Info,
        color: "text-sky-300",
        pill: "bg-sky-500/20 text-sky-200 border-sky-500/40"
      };
  }
}

export function AlertsSlideOver() {
  const close = useAlertsPanelStore((s) => s.close);
  const [acknowledged, setAcknowledged] = useState<string[]>([]);

  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => [...prev, id]);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Realtime Alerts
          </p>
          <p className="text-sm font-semibold text-slate-50">
            AI Governance Queue
          </p>
        </div>
        <button
          onClick={close}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-charcoal-800/80 text-slate-300 hover:bg-charcoal-700"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-border/60 bg-charcoal-900/90 px-4 py-3 text-xs text-slate-200">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300">
          ⓘ
        </span>
        <p>
          Alerts are derived from live model telemetry: drift, approvals, LLM
          safety signals, and custom rules.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
        {MOCK_ALERTS.map((alert) => {
          const styles = severityStyles(alert.severity);
          const Icon = styles.icon;
          const isAck = acknowledged.includes(alert.id);

          return (
            <div
              key={alert.id}
              className="glass-panel flex flex-col gap-2 rounded-lg border border-border/60 bg-charcoal-900/80 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-charcoal-800/80 ${styles.color}`}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="font-medium text-slate-50">{alert.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {alert.suggestedAction}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.pill}`}
                >
                  {styles.label}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{alert.timestamp}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                      isAck
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                        : "border-border/60 bg-charcoal-800/80 text-slate-200 hover:bg-charcoal-700"
                    }`}
                  >
                    {isAck ? "Acknowledged" : "Acknowledge"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-border/60 bg-charcoal-900/95 px-4 py-3 text-xs">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button className="inline-flex items-center justify-center gap-1 rounded-md border border-red-500/60 bg-red-500/10 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-red-200 hover:bg-red-500/20">
            Freeze Approvals
          </button>
          <button className="inline-flex items-center justify-center gap-1 rounded-md border border-sky-500/60 bg-sky-500/10 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-sky-200 hover:bg-sky-500/20">
            Trigger Retraining
          </button>
          <button className="inline-flex items-center justify-center gap-1 rounded-md border border-amber-500/60 bg-amber-500/10 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-amber-200 hover:bg-amber-500/20">
            Update Policy
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          All actions are logged to the audit trail with actor, scope, and
          justification.
        </p>
      </div>
    </div>
  );
}

