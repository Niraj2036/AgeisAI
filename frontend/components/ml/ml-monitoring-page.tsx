"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
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
import { useRouter } from "next/navigation";
import { useDashboardStore } from "../../hooks/use-dashboard-store";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "../../ui/table";
import { Button } from "../../ui/button";

function deriveKpiDialColor(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-amber-300";
  return "text-red-300";
}

export function MlMonitoringPage() {
  const router = useRouter();
  const { load, tick, mlKpis, mlModels, thresholds } = useDashboardStore();

  useEffect(() => {
    load();
    const id = setInterval(() => tick(), 7000);
    return () => clearInterval(id);
  }, [load, tick]);

  const driftSeries =
    mlModels.length > 0
      ? mlModels.map((m) => ({
          name: m.name,
          drift: m.drift
        }))
      : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden">
            <CardHeader className="border-none pb-1">
              <CardTitle>Overall ML Health Score</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 pt-0">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-slate-700 bg-radial from-emerald-500/20 to-slate-900/10">
                <div className="absolute inset-1 rounded-full bg-charcoal-900/80" />
                <div className="relative text-3xl font-semibold tracking-tight">
                  <span
                    className={deriveKpiDialColor(mlKpis?.healthScore ?? 0)}
                  >
                    {Math.round(mlKpis?.healthScore ?? 0)}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <p>
                  Accuracy avg:{" "}
                  <span className="text-slate-100">
                    {(mlKpis?.avgAccuracy ?? 0).toFixed(3)}
                  </span>
                </p>
                <p>
                  Drift avg:{" "}
                  <span className="text-slate-100">
                    {(mlKpis?.avgDrift ?? 0).toFixed(3)}
                  </span>
                  <span className="ml-1 text-slate-500">
                    (threshold {thresholds.driftThreshold})
                  </span>
                </p>
                <p>
                  Active models:{" "}
                  <span className="text-slate-100">
                    {mlKpis?.totalModels ?? mlModels.length}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Avg Model Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-4">
            <div className="text-3xl font-semibold text-slate-50">
              {((mlKpis?.avgAccuracy ?? 0) * 100).toFixed(1)}
              <span className="ml-1 text-base text-slate-400">%</span>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mlModels}
                  margin={{ left: -24, right: 0, top: 4, bottom: 0 }}
                >
                  <Line
                    type="monotone"
                    dataKey={(m: any) => m.accuracy * 100}
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Drift Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-4">
            <div className="text-3xl font-semibold text-slate-50">
              {(mlKpis?.avgDrift ?? 0).toFixed(2)}
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={driftSeries}
                  margin={{ left: -24, top: 4, right: 0, bottom: 0 }}
                >
                  <Bar dataKey="drift" fill="#facc15" radius={3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Active Models</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-semibold text-slate-50">
              {mlModels.length}
            </div>
            <Badge variant="outline">Fleet overview</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Drift</TableHead>
                <TableHead>Approval Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mlModels.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-slate-50">
                    {m.name}
                  </TableCell>
                  <TableCell>{m.version}</TableCell>
                  <TableCell>{(m.accuracy * 100).toFixed(2)}%</TableCell>
                  <TableCell
                    className={
                      m.drift > thresholds.driftThreshold
                        ? "text-red-300"
                        : m.drift > thresholds.driftThreshold * 0.75
                        ? "text-amber-300"
                        : "text-emerald-300"
                    }
                  >
                    {m.drift.toFixed(3)}
                  </TableCell>
                  <TableCell>{(m.approvalRate * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        m.status === "critical"
                          ? "critical"
                          : m.status === "warning"
                          ? "warning"
                          : "success"
                      }
                    >
                      {m.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(`/ml-monitoring/${m.id}`)}
                    >
                      View Details
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

