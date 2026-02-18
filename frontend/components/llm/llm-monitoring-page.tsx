"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useDashboardStore } from "../../hooks/use-dashboard-store";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "../../ui/table";
import { Button } from "../../ui/button";

export function LlmMonitoringPage() {
  const { load, tick, llmKpis, llmSeries, llmFlagged, thresholds } =
    useDashboardStore();

  useEffect(() => {
    load();
    const id = setInterval(() => tick(), 8000);
    return () => clearInterval(id);
  }, [load, tick]);

  const hallucinationCritical =
    (llmKpis?.hallucinationRate ?? 0) > thresholds.hallucinationThreshold;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={hallucinationCritical ? "kpi-glow-critical" : ""}>
            <CardHeader>
              <CardTitle>Hallucination Rate</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4">
              <div className="text-3xl font-semibold text-slate-50">
                {(llmKpis?.hallucinationRate ?? 0).toFixed(1)}
                <span className="ml-1 text-base text-slate-400">%</span>
              </div>
              <div className="text-xs text-slate-400">
                Threshold{" "}
                <span className="text-slate-100">
                  {thresholds.hallucinationThreshold}%
                </span>
                {hallucinationCritical && (
                  <p className="mt-1 text-[11px] text-red-300">
                    Above target · tighten guardrails
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Avg Response Latency</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-3xl font-semibold text-slate-50">
              {llmKpis?.avgLatencyMs ?? "--"}
              <span className="ml-1 text-base text-slate-400">ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Usage Today</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-slate-50">
            {(llmKpis?.tokenUsageToday ?? 0).toLocaleString()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Violations</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-semibold text-slate-50">
              {llmKpis?.safetyViolations ?? 0}
            </div>
            <Badge variant="warning">Last 24h</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Quality</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={llmSeries}>
                <CartesianGrid
                  stroke="#1f2937"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  domain={[0.7, 1]}
                  tickFormatter={(v) => v.toFixed(2)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#1f2937",
                    fontSize: 12
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
                <Area
                  type="monotone"
                  dataKey="quality"
                  stroke="#38bdf8"
                  fill="#0ea5e9"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prompt Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={llmSeries}>
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
                <Bar dataKey="volume" fill="#22c55e" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Risk Flag</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {llmFlagged.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {new Date(row.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-slate-200">
                    {row.prompt}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-slate-400">
                    {row.response}
                  </TableCell>
                  <TableCell>{row.riskFlag}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.severity === "high"
                          ? "critical"
                          : row.severity === "medium"
                          ? "warning"
                          : "success"
                      }
                    >
                      {row.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm">
                      Block Response
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

