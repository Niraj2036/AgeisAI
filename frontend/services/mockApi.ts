import type {
  MlKpiSummary,
  MlModelSummary,
  MlModelDetail,
  LlmKpiSummary,
  LlmQualityPoint,
  LlmFlaggedResponse,
  RiskOverview,
  RiskDistributionSlice,
  ApprovalSpikePoint,
  PolicyViolationLog,
  AlertItem,
  AuditLogEntry,
  ThresholdSettings,
  PolicySettings
} from "../types/dashboard";

function nowLabel(offsetMinutes = 0) {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export const mockThresholds: ThresholdSettings = {
  driftThreshold: 0.4,
  hallucinationThreshold: 5,
  riskSpikeThreshold: 65
};

export const mockPolicies: PolicySettings = {
  freezeApprovals: false,
  enableGuardrails: true,
  globalThrottle: false
};

export function fetchMlKpis(): MlKpiSummary {
  const models = fetchMlModels();
  const avgAccuracy =
    models.reduce((acc, m) => acc + m.accuracy, 0) / models.length;
  const avgDrift = models.reduce((acc, m) => acc + m.drift, 0) / models.length;
  const criticalCount = models.filter((m) => m.status === "critical").length;

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      avgAccuracy * 100 -
        avgDrift * 40 -
        criticalCount * 8
    )
  );

  return {
    healthScore,
    avgAccuracy,
    avgDrift,
    totalModels: models.length
  };
}

export function fetchMlModels(): MlModelSummary[] {
  return [
    {
      id: "credit-risk-v3",
      name: "Credit Risk Scoring",
      version: "3.2.1",
      accuracy: 0.942,
      drift: 0.18,
      approvalRate: 0.61,
      status: "safe"
    },
    {
      id: "loan-default-v2",
      name: "Loan Default Classifier",
      version: "2.4.0",
      accuracy: 0.903,
      drift: 0.33,
      approvalRate: 0.54,
      status: "warning"
    },
    {
      id: "fraud-detection-v5",
      name: "Transaction Fraud Detector",
      version: "5.0.3",
      accuracy: 0.976,
      drift: 0.41,
      approvalRate: 0.48,
      status: "critical"
    },
    {
      id: "collections-priority-v1",
      name: "Collections Prioritization",
      version: "1.7.2",
      accuracy: 0.887,
      drift: 0.27,
      approvalRate: 0.39,
      status: "warning"
    }
  ];
}

export function fetchMlModelDetail(id: string): MlModelDetail | undefined {
  const models = fetchMlModels();
  const base = models.find((m) => m.id === id);
  if (!base) return undefined;

  const accuracyTrend = Array.from({ length: 12 }).map((_, idx) => ({
    timestamp: Date.now() - (11 - idx) * 60 * 60 * 1000,
    label: `${11 - idx}h`,
    value:
      base.accuracy +
      (Math.sin(idx / 3) * 0.015 - 0.01)
  }));

  const driftTrend = Array.from({ length: 12 }).map((_, idx) => ({
    timestamp: Date.now() - (11 - idx) * 60 * 60 * 1000,
    label: `${11 - idx}h`,
    value:
      base.drift +
      (Math.cos(idx / 3) * 0.04 - 0.02)
  }));

  const approvalPattern = [
    { label: "Retail", approvals: Math.round(base.approvalRate * 1200) },
    { label: "SME", approvals: Math.round(base.approvalRate * 640) },
    { label: "Private", approvals: Math.round(base.approvalRate * 280) },
    { label: "Corporate", approvals: Math.round(base.approvalRate * 130) }
  ];

  const confusionMatrix = [
    { row: "Actual: Default", col: "Pred: Default", value: 624 },
    { row: "Actual: Default", col: "Pred: No Default", value: 71 },
    { row: "Actual: No Default", col: "Pred: Default", value: 54 },
    { row: "Actual: No Default", col: "Pred: No Default", value: 2148 }
  ];

  const logs: MlPredictionLog[] = Array.from({ length: 40 }).map((_, idx) => ({
    id: `${id}-log-${idx}`,
    timestamp: new Date(Date.now() - idx * 7 * 60 * 1000).toISOString(),
    inputSummary: `Income ${52 + idx}k · Utilization ${(32 + idx) % 60}%`,
    prediction: idx % 7 === 0 ? "Default" : "No Default",
    confidence: 0.82 + ((idx % 5) * 0.03 - 0.04),
    riskScore: 0.28 + ((idx % 9) * 0.02 - 0.09),
    latencyMs: 85 + (idx % 11) * 3
  }));

  return {
    id: base.id,
    name: base.name,
    version: base.version,
    lastRetrained: "2026-01-28T08:32:00Z",
    status: base.status,
    accuracyTrend,
    driftTrend,
    approvalPattern,
    confusionMatrix,
    logs
  };
}

export interface MlPredictionLog {
  id: string;
  timestamp: string;
  inputSummary: string;
  prediction: string;
  confidence: number;
  riskScore: number;
  latencyMs: number;
}

export function fetchLlmKpis(): LlmKpiSummary {
  return {
    hallucinationRate: 3.2,
    avgLatencyMs: 148,
    tokenUsageToday: 1_820_450,
    safetyViolations: 7
  };
}

export function fetchLlmQualitySeries(): LlmQualityPoint[] {
  return Array.from({ length: 24 }).map((_, idx) => ({
    timestamp: Date.now() - (23 - idx) * 60 * 60 * 1000,
    label: `${23 - idx}h`,
    quality: 0.86 + (Math.sin(idx / 4) * 0.08 - 0.04),
    volume: 120 + (idx % 8) * 24
  }));
}

export function fetchLlmFlaggedResponses(): LlmFlaggedResponse[] {
  return [
    {
      id: "f1",
      timestamp: new Date().toISOString(),
      prompt: "Explain why my loan was rejected.",
      response:
        "Your loan was rejected because of factors that I cannot disclose.",
      riskFlag: "Opaque justification",
      severity: "medium"
    },
    {
      id: "f2",
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      prompt: "Can you help me hide transactions from the bank?",
      response: "I cannot help with that. However, you may consider...",
      riskFlag: "Boundary probing",
      severity: "high"
    },
    {
      id: "f3",
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      prompt: "What is my exact internal risk score?",
      response: "Your risk score is 912 out of 1000.",
      riskFlag: "Leaking internal scoring",
      severity: "high"
    }
  ];
}

export function fetchRiskOverview(): RiskOverview {
  return {
    avgRiskScore: 0.31,
    highRiskConcentration: 18,
    approvalSpike: 72
  };
}

export function fetchRiskDistribution(): RiskDistributionSlice[] {
  return [
    { label: "Low", value: 58 },
    { label: "Medium", value: 29 },
    { label: "High", value: 13 }
  ];
}

export function fetchApprovalSpikes(): ApprovalSpikePoint[] {
  return Array.from({ length: 12 }).map((_, idx) => ({
    timestamp: Date.now() - (11 - idx) * 60 * 60 * 1000,
    label: nowLabel(-(11 - idx) * 60),
    approvals: 220 + (idx % 4) * 55 + (idx > 7 ? 90 : 0)
  }));
}

export function fetchPolicyViolations(): PolicyViolationLog[] {
  return [
    {
      id: "pv-1",
      timestamp: new Date().toISOString(),
      policy: "High-risk approvals > 10% of daily volume",
      actor: "Risk Engine",
      impact: "Escalated to credit committee"
    },
    {
      id: "pv-2",
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      policy: "Manual override without justification",
      actor: "Loan Officer · Desk 17",
      impact: "Session flagged for review"
    }
  ];
}

export function fetchAlerts(): AlertItem[] {
  return [
    {
      id: "a1",
      severity: "high",
      source: "Risk",
      description: "Anomalous approval spike in high-risk segment.",
      timestamp: "2 min ago",
      status: "open"
    },
    {
      id: "a2",
      severity: "medium",
      source: "LLM",
      description: "Hallucination rate trending above target.",
      timestamp: "11 min ago",
      status: "open"
    },
    {
      id: "a3",
      severity: "low",
      source: "ML",
      description: "Drift approaching threshold for Credit Risk v3.",
      timestamp: "28 min ago",
      status: "open"
    }
  ];
}

export function fetchAuditLogs(): AuditLogEntry[] {
  return Array.from({ length: 80 }).map((_, idx) => ({
    id: `log-${idx}`,
    applicationId: `QB-${2026000 + idx}`,
    income: 42_000 + (idx % 15) * 5500,
    creditScore: 540 + (idx % 18) * 12,
    loanAmount: 24_000 + (idx % 22) * 3500,
    riskScore: 0.18 + (idx % 17) * 0.02,
    decision: idx % 4 === 0 ? "rejected" : "approved",
    aiHealthSnapshot:
      idx % 9 === 0 ? "critical" : idx % 4 === 0 ? "warning" : "safe",
    timestamp: new Date(Date.now() - idx * 11 * 60 * 1000).toISOString()
  }));
}

