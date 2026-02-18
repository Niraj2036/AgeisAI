"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
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
import { ScrollArea } from "../../ui/scroll-area";

export function MlModelDetailPage() {
  const params = useParams<{ modelId: string }>();
  const modelId = params?.modelId;
  const { mlModels, mlModelDetails, load, thresholds } = useDashboardStore();

  useEffect(() => {
    load();
  }, [load]);

  const detail = useMemo(() => {
    if (!modelId) return undefined;
    if (mlModelDetails[modelId]) return mlModelDetails[modelId];
    // Compute on the fly from mock API helper
    // We intentionally re-import to avoid circular store deps.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { fetchMlModelDetail } = require("../../services/mockApi");
    const d = fetchMlModelDetail(modelId);
    return d;
  }, [modelId, mlModelDetails]);

  const base = mlModels.find((m) => m.id === modelId);

  const driftBreached =
    (detail?.driftTrend.at(-1)?.value ?? base?.drift ?? 0) >
    thresholds.driftThreshold;

  if (!modelId || !detail || !base) {
    return (
      <div className="text-sm text-slate-400">
        Model not found. Return to ML Monitoring to select a model.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Model Detail
          </p>
          <h2 className="text-xl font-semibold text-slate-50">
            {detail.name}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Version {detail.version} · Last retrained{" "}
            {new Date(detail.lastRetrained).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              detail.status === "critical"
                ? "critical"
                : detail.status === "warning"
                ? "warning"
                : "success"
            }
          >
            {detail.status.toUpperCase()}
          </Badge>
          <div className="rounded-md bg-charcoal-900/70 px-3 py-1 text-[11px] text-slate-400">
            Accuracy {(base.accuracy * 100).toFixed(2)}% · Drift{" "}
            {base.drift.toFixed(3)}
          </div>
        </div>
      </div>

      {driftBreached && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="kpi-glow-critical glass-panel flex items-center gap-3 rounded-lg border border-red-500/70 bg-red-950/30 px-4 py-3 text-xs text-red-100"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-500/20 text-red-200">
            !
          </span>
          <div>
            <p className="font-medium">Model Behavior Anomaly Detected</p>
            <p className="text-[11px] text-red-200/90">
              Latest drift score exceeds configured threshold (
              {thresholds.driftThreshold}). Route traffic to safe fallback or
              initiate retraining.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detail.accuracyTrend}>
                <CartesianGrid
                  stroke="#1f2937"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis
                  stroke="#6b7280"
                  domain={[0.8, 1]}
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drift Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={detail.driftTrend}>
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
                  dataKey="value"
                  stroke="#facc15"
                  strokeWidth={2}
                  dot={false}
                />
                {thresholds.driftThreshold && (
                  <Line
                    type="monotone"
                    dataKey={() => thresholds.driftThreshold}
                    stroke="#f97373"
                    strokeDasharray="4 4"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Approval Patterns</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detail.approvalPattern}>
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
                <Bar dataKey="approvals" fill="#38bdf8" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {detail.confusionMatrix.map((cell) => (
                <div
                  key={`${cell.row}-${cell.col}`}
                  className="rounded-md border border-border/70 bg-charcoal-900/80 p-3"
                >
                  <p className="text-[11px] text-slate-400">
                    {cell.row} / {cell.col}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-50">
                    {cell.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Input Summary</TableHead>
                  <TableHead>Prediction</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.inputSummary}</TableCell>
                    <TableCell>{log.prediction}</TableCell>
                    <TableCell>{(log.confidence * 100).toFixed(1)}%</TableCell>
                    <TableCell>{log.riskScore.toFixed(2)}</TableCell>
                    <TableCell>{log.latencyMs} ms</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

