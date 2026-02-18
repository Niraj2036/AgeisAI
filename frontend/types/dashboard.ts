export type ModelStatus = "safe" | "warning" | "critical";

export interface MlModelSummary {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  drift: number;
  approvalRate: number;
  status: ModelStatus;
}

export interface MlKpiSummary {
  healthScore: number;
  avgAccuracy: number;
  avgDrift: number;
  totalModels: number;
}

export interface TimeseriesPoint {
  timestamp: number;
  label: string;
  value: number;
}

export interface ConfusionMatrixCell {
  row: string;
  col: string;
  value: number;
}

export interface MlModelDetail {
  id: string;
  name: string;
  version: string;
  lastRetrained: string;
  status: ModelStatus;
  accuracyTrend: TimeseriesPoint[];
  driftTrend: TimeseriesPoint[];
  approvalPattern: { label: string; approvals: number }[];
  confusionMatrix: ConfusionMatrixCell[];
  logs: MlPredictionLog[];
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

export interface LlmKpiSummary {
  hallucinationRate: number;
  avgLatencyMs: number;
  tokenUsageToday: number;
  safetyViolations: number;
}

export interface LlmQualityPoint {
  timestamp: number;
  label: string;
  quality: number;
  volume: number;
}

export interface LlmFlaggedResponse {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  riskFlag: string;
  severity: "low" | "medium" | "high";
}

export interface RiskOverview {
  avgRiskScore: number;
  highRiskConcentration: number;
  approvalSpike: number;
}

export interface RiskDistributionSlice {
  label: string;
  value: number;
}

export interface ApprovalSpikePoint {
  timestamp: number;
  label: string;
  approvals: number;
}

export interface PolicyViolationLog {
  id: string;
  timestamp: string;
  policy: string;
  actor: string;
  impact: string;
}

export type AlertSeverity = "low" | "medium" | "high";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  source: "ML" | "LLM" | "Risk";
  description: string;
  timestamp: string;
  status: "open" | "resolved";
}

export interface AuditLogEntry {
  id: string;
  applicationId: string;
  income: number;
  creditScore: number;
  loanAmount: number;
  riskScore: number;
  decision: "approved" | "rejected";
  aiHealthSnapshot: "safe" | "warning" | "critical";
  timestamp: string;
}

export interface ThresholdSettings {
  driftThreshold: number;
  hallucinationThreshold: number;
  riskSpikeThreshold: number;
}

export interface PolicySettings {
  freezeApprovals: boolean;
  enableGuardrails: boolean;
  globalThrottle: boolean;
}

