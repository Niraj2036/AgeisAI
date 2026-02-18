"use client";

import { create } from "zustand";
import {
  fetchMlKpis,
  fetchMlModels,
  fetchMlModelDetail,
  fetchLlmKpis,
  fetchLlmQualitySeries,
  fetchLlmFlaggedResponses,
  fetchRiskOverview,
  fetchRiskDistribution,
  fetchApprovalSpikes,
  fetchPolicyViolations,
  fetchAlerts,
  fetchAuditLogs,
  mockPolicies,
  mockThresholds
} from "../services/mockApi";
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

interface DashboardState {
  initialized: boolean;
  mlKpis: MlKpiSummary | null;
  mlModels: MlModelSummary[];
  mlModelDetails: Record<string, MlModelDetail>;
  llmKpis: LlmKpiSummary | null;
  llmSeries: LlmQualityPoint[];
  llmFlagged: LlmFlaggedResponse[];
  riskOverview: RiskOverview | null;
  riskDistribution: RiskDistributionSlice[];
  approvalSpikes: ApprovalSpikePoint[];
  policyViolations: PolicyViolationLog[];
  alerts: AlertItem[];
  auditLogs: AuditLogEntry[];
  thresholds: ThresholdSettings;
  policies: PolicySettings;
  load: () => void;
  tick: () => void;
  updateAlertStatus: (id: string, status: AlertItem["status"]) => void;
  updateThresholds: (patch: Partial<ThresholdSettings>) => void;
  updatePolicies: (patch: Partial<PolicySettings>) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  initialized: false,
  mlKpis: null,
  mlModels: [],
  mlModelDetails: {},
  llmKpis: null,
  llmSeries: [],
  llmFlagged: [],
  riskOverview: null,
  riskDistribution: [],
  approvalSpikes: [],
  policyViolations: [],
  alerts: [],
  auditLogs: [],
  thresholds: mockThresholds,
  policies: mockPolicies,
  load: () => {
    if (get().initialized) return;
    const mlModels = fetchMlModels();
    const mlKpis = fetchMlKpis();
    const llmKpis = fetchLlmKpis();
    const llmSeries = fetchLlmQualitySeries();
    const llmFlagged = fetchLlmFlaggedResponses();
    const riskOverview = fetchRiskOverview();
    const riskDistribution = fetchRiskDistribution();
    const approvalSpikes = fetchApprovalSpikes();
    const policyViolations = fetchPolicyViolations();
    const alerts = fetchAlerts();
    const auditLogs = fetchAuditLogs();

    set({
      initialized: true,
      mlKpis,
      mlModels,
      llmKpis,
      llmSeries,
      llmFlagged,
      riskOverview,
      riskDistribution,
      approvalSpikes,
      policyViolations,
      alerts,
      auditLogs
    });
  },
  tick: () => {
    const state = get();
    if (!state.mlKpis || !state.llmKpis || !state.riskOverview) return;

    const jitter = (value: number, magnitude: number, min = 0, max = 1) => {
      const delta = (Math.random() - 0.5) * magnitude * 2;
      return Math.min(max, Math.max(min, value + delta));
    };

    const mlModels = state.mlModels.map((m) => ({
      ...m,
      accuracy: jitter(m.accuracy, 0.01, 0.85, 0.99),
      drift: jitter(m.drift, 0.03, 0, 0.7),
      approvalRate: jitter(m.approvalRate, 0.02, 0.2, 0.9)
    }));

    const mlKpis = fetchMlKpis();

    const llmKpis: LlmKpiSummary = {
      hallucinationRate: jitter(state.llmKpis.hallucinationRate, 0.8, 0, 12),
      avgLatencyMs: Math.round(
        jitter(state.llmKpis.avgLatencyMs, 12, 90, 260)
      ),
      tokenUsageToday:
        state.llmKpis.tokenUsageToday +
        Math.round(Math.random() * 6000 + 2000),
      safetyViolations:
        state.llmKpis.safetyViolations +
        (Math.random() > 0.8 ? 1 : 0)
    };

    const riskOverview: RiskOverview = {
      avgRiskScore: jitter(state.riskOverview.avgRiskScore, 0.02, 0.1, 0.7),
      highRiskConcentration: Math.round(
        jitter(state.riskOverview.highRiskConcentration / 100, 0.03, 0, 0.6) *
          100
      ),
      approvalSpike: Math.round(
        jitter(state.riskOverview.approvalSpike / 100, 0.05, 0, 1.1) * 100
      )
    };

    set({
      mlModels,
      mlKpis,
      llmKpis,
      riskOverview
    });
  },
  updateAlertStatus: (id, status) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, status } : a
      )
    }));
  },
  updateThresholds: (patch) => {
    set((state) => ({
      thresholds: { ...state.thresholds, ...patch }
    }));
  },
  updatePolicies: (patch) => {
    set((state) => ({
      policies: { ...state.policies, ...patch }
    }));
  }
}));

