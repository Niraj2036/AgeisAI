"use client";

import { useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { motion } from "framer-motion";
import { useDashboardStore } from "../../hooks/use-dashboard-store";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from "../../ui/table";

const PIE_COLORS = ["#22c55e", "#eab308", "#f97373"];

export function RiskEnginePage() {
  const {
    load,
    tick,
    riskOverview,
    riskDistribution,
    approvalSpikes,
    policyViolations,
    thresholds
  } = useDashboardStore();

  useEffect(() => {
    load();
    const id = setInterval(() => tick(), 9000);
    return () => clearInterval(id);
  }, [load, tick]);

  const behaviorCritical =
    (riskOverview?.approvalSpike ?? 0) > thresholds.riskSpikeThreshold;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Avg Portfolio Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-semibold text-slate-50">
              {riskOverview?.avgRiskScore.toFixed(2) ?? "--"}
            </div>
            <p className="text-xs text-slate-400">
              Weighted by exposure and delinquency.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High-Risk Concentration</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-semibold text-slate-50">
              {riskOverview?.highRiskConcentration ?? "--"}%
            </div>
            <Badge variant="warning">Tier 2 limit 25%</Badge>
          </CardContent>
        </Card>

        <Card className={behaviorCritical ? "kpi-glow-critical" : ""}>
          <CardHeader>
            <CardTitle>Approval Spike Indicator</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-semibold text-slate-50">
              {riskOverview?.approvalSpike ?? "--"}%
            </div>
            <p className="text-xs text-slate-400">
              Threshold {thresholds.riskSpikeThreshold}% of baseline volume.
            </p>
          </CardContent>
        </Card>
      </div>

      {behaviorCritical && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="kpi-glow-critical glass-panel flex items-center gap-3 rounded-lg border border-red-500/70 bg-red-950/30 px-4 py-3 text-xs text-red-100"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-500/20 text-red-200">
            !
          </span>
          <div>
            <p className="font-medium">Anomalous Approval Behavior Detected</p>
            <p className="text-[11px] text-red-200/90">
              High-risk approvals are above configured spike threshold. Consider
              tightening policy and pausing segments.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={40}
                  outerRadius={72}
                  paddingAngle={4}
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1f2937",
                    fontSize: 12
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Spikes</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={approvalSpikes}>
                <CartesianGrid
                  stroke="#1f2937"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1f2937",
                    fontSize: 12
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
                <Line
                  type="monotone"
                  dataKey="approvals"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Violation Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Policy</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policyViolations.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.policy}</TableCell>
                  <TableCell>{log.actor}</TableCell>
                  <TableCell>{log.impact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

