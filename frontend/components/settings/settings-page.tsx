"use client";

import { useEffect } from "react";
import { useDashboardStore } from "../../hooks/use-dashboard-store";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { Button } from "../../ui/button";

export function SettingsPage() {
  const {
    load,
    thresholds,
    policies,
    updateThresholds,
    updatePolicies
  } = useDashboardStore();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Threshold Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Drift Threshold</Label>
            <Input
              type="number"
              step={0.05}
              value={thresholds.driftThreshold}
              onChange={(e) =>
                updateThresholds({
                  driftThreshold: parseFloat(e.target.value)
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Hallucination Threshold (%)</Label>
            <Input
              type="number"
              step={0.5}
              value={thresholds.hallucinationThreshold}
              onChange={(e) =>
                updateThresholds({
                  hallucinationThreshold: parseFloat(e.target.value)
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Risk Spike Threshold (%)</Label>
            <Input
              type="number"
              step={1}
              value={thresholds.riskSpikeThreshold}
              onChange={(e) =>
                updateThresholds({
                  riskSpikeThreshold: parseFloat(e.target.value)
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Policy Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-charcoal-900/80 px-3 py-2 text-xs">
            <div>
              <p className="font-medium text-slate-100">Freeze Approvals</p>
              <p className="text-[11px] text-slate-400">
                Stop new loan approvals while investigation is running.
              </p>
            </div>
            <Switch
              checked={policies.freezeApprovals}
              onChange={() =>
                updatePolicies({
                  freezeApprovals: !policies.freezeApprovals
                })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-charcoal-900/80 px-3 py-2 text-xs">
            <div>
              <p className="font-medium text-slate-100">Enable Guardrails</p>
              <p className="text-[11px] text-slate-400">
                Enforce policy templates across ML and LLM stack.
              </p>
            </div>
            <Switch
              checked={policies.enableGuardrails}
              onChange={() =>
                updatePolicies({
                  enableGuardrails: !policies.enableGuardrails
                })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-charcoal-900/80 px-3 py-2 text-xs">
            <div>
              <p className="font-medium text-slate-100">Global Throttle</p>
              <p className="text-[11px] text-slate-400">
                Apply rate limits across all AI entrypoints.
              </p>
            </div>
            <Switch
              checked={policies.globalThrottle}
              onChange={() =>
                updatePolicies({
                  globalThrottle: !policies.globalThrottle
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-xs">
          <Button variant="secondary">Retrain Model Fleet</Button>
          <Button>Deploy New Version</Button>
          <Button variant="outline">Simulate Shadow Deployment</Button>
        </CardContent>
      </Card>
    </div>
  );
}

