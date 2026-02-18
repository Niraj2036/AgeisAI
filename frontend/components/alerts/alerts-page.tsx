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
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";

const severities = ["all", "low", "medium", "high"] as const;

export function AlertsPage() {
  const { load, alerts, updateAlertStatus } = useDashboardStore();
  const [severityFilter, setSeverityFilter] =
    useState<(typeof severities)[number]>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      alerts.filter((a) => {
        if (severityFilter !== "all" && a.severity !== severityFilter) {
          return false;
        }
        if (
          search &&
          !a.description.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [alerts, severityFilter, search]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Alert Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {severities.map((sev) => (
              <Button
                key={sev}
                size="sm"
                variant={severityFilter === sev ? "default" : "secondary"}
                onClick={() => setSeverityFilter(sev)}
              >
                {sev === "all" ? "All Severities" : sev.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="w-full max-w-xs">
            <Input
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "critical"
                          : alert.severity === "medium"
                          ? "warning"
                          : "success"
                      }
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{alert.source}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {alert.description}
                  </TableCell>
                  <TableCell>{alert.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {alert.status === "open" ? "Open" : "Resolved"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateAlertStatus(alert.id, "open")}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateAlertStatus(alert.id, "resolved")}
                    >
                      Resolve
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

