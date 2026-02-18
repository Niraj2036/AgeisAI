"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboardStore } from "../../hooks/use-dashboard-store";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from "../../ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

export function AuditLogsPage() {
  const { load, auditLogs } = useDashboardStore();
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      auditLogs.filter((row) => {
        if (search && !row.applicationId.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }

        if (riskFilter !== "all") {
          if (riskFilter === "low" && row.riskScore >= 0.33) return false;
          if (riskFilter === "medium" && (row.riskScore < 0.33 || row.riskScore >= 0.66)) return false;
          if (riskFilter === "high" && row.riskScore < 0.66) return false;
        }

        return true;
      }),
    [auditLogs, search, riskFilter]
  );

  const handleExport = () => {
    const header = [
      "Application ID",
      "Income",
      "Credit Score",
      "Loan Amount",
      "Risk Score",
      "Decision",
      "AI Health Snapshot",
      "Timestamp"
    ].join(",");

    const rows = filtered
      .map((row) =>
        [
          row.applicationId,
          row.income,
          row.creditScore,
          row.loanAmount,
          row.riskScore.toFixed(2),
          row.decision,
          row.aiHealthSnapshot,
          row.timestamp
        ].join(",")
      )
      .join("\n");

    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "audit-logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {["all", "low", "medium", "high"].map((level) => (
              <Button
                key={level}
                size="sm"
                variant={riskFilter === level ? "default" : "secondary"}
                onClick={() =>
                  setRiskFilter(level as "all" | "low" | "medium" | "high")
                }
              >
                {level === "all"
                  ? "All Risk Levels"
                  : `${level.charAt(0).toUpperCase()}${level.slice(1)} Risk`}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by Application ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={handleExport}>
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>AI Health Snapshot</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-slate-50">
                    {row.applicationId}
                  </TableCell>
                  <TableCell>
                    {row.income.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0
                    })}
                  </TableCell>
                  <TableCell>{row.creditScore}</TableCell>
                  <TableCell>
                    {row.loanAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0
                    })}
                  </TableCell>
                  <TableCell>{row.riskScore.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.decision === "approved" ? "success" : "critical"
                      }
                    >
                      {row.decision.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.aiHealthSnapshot === "critical"
                          ? "critical"
                          : row.aiHealthSnapshot === "warning"
                          ? "warning"
                          : "success"
                      }
                    >
                      {row.aiHealthSnapshot.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(row.timestamp).toLocaleString()}
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

