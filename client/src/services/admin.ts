import api from "./api";
import { signalsService } from "./signals";
import { campService } from "./camp";
import type { Signal } from "@/types/signals";

export type PlatformAnalytics = {
  totalSignals: number;
  totalTrades: number;
  totalUsers: number;
  totalIPAssets: number;
  totalVolume: number;
  totalRevenue: number;
  avgSignalAccuracy: number;
  mostTradedSymbol: string;
  topPerformer: string;
};

const P = {
  PENDING: "/admin/signals/pending",
  APPROVED: "/admin/signals/approved",
  GENERATE: "/admin/signals/generate-platform",
  APPROVE: (id: string) => `/admin/signals/${id}/approve`,
  REJECT: (id: string) => `/admin/signals/${id}/reject`,
  OVERVIEW: "/admin/analytics/overview",
  DETAILED: "/admin/analytics/detailed",
  MARK_MINTED: (id: string) => `/signals/${id}/mark-minted`,
};

export const adminService = {
  async getSignalsForReview(params?: {
    minConfidence?: number;
    maxAge?: number;
    symbol?: string;
    aiModel?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<{ signals: Signal[]; total: number }> {
    const sp = new URLSearchParams();
    if (params) {
      if (params.minConfidence !== undefined) sp.append("minConfidence", String(params.minConfidence));
      if (params.maxAge !== undefined) sp.append("maxAge", String(params.maxAge));
      if (params.symbol) sp.append("symbol", params.symbol);
      if (params.aiModel) sp.append("aiModel", params.aiModel);
      if (params.sortBy) sp.append("sortBy", params.sortBy);
      if (params.limit !== undefined) sp.append("limit", String(params.limit));
    }
    return api.get(`${P.PENDING}?${sp.toString()}`);
  },

  async getApprovedForMinting(): Promise<{ signals: Signal[]; total: number }> {
    return api.get(P.APPROVED);
  },

  async approveSignal(signalId: string, adminNotes?: string): Promise<{ signal: Signal; message: string }> {
    return api.put(P.APPROVE(signalId), { adminNotes });
  },

  async rejectSignal(signalId: string, adminNotes: string): Promise<{ signal: Signal; message: string }> {
    return api.put(P.REJECT(signalId), { adminNotes });
  },

  async generatePlatformSignals(count: number = 25): Promise<{ signals: Signal[]; generated: number; message: string }> {
    return api.post(P.GENERATE, { count });
  },

  async markSignalMinted(
    signalId: string,
    payload: { tokenId: string; transactionHash: string }
  ): Promise<{ success: boolean }> {
    return api.put(P.MARK_MINTED(signalId), payload);
  },

  async mintSignalAsParent(signalId: string): Promise<{ tokenId: string; transactionHash: string }> {
    const { signal } = await signalsService.getSignal(signalId);
    const { tokenId, transactionHash } = await campService.mintSignalAsParent(signal);
    await api.put(P.MARK_MINTED(signalId), { tokenId, transactionHash });
    return { tokenId, transactionHash };
  },

  async batchMintSignals(signalIds: string[]) {
    const out: Array<{ signalId: string; success: boolean; tokenId?: string; error?: string }> = [];
    for (const id of signalIds) {
      try {
        const r = await this.mintSignalAsParent(id);
        out.push({ signalId: id, success: true, tokenId: r.tokenId });
      } catch (e: any) {
        out.push({ signalId: id, success: false, error: e?.message || "Failed" });
      }
    }
    return out;
  },

  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const r = await api.get<{ overview: PlatformAnalytics }>(P.OVERVIEW);
    return r.overview;
  },

  async getDetailedAnalytics(timeframe?: "24h" | "7d" | "30d" | "90d" | "1y") {
    const q = timeframe ? `?timeframe=${timeframe}` : "";
    return api.get(P.DETAILED + q);
  },
};
