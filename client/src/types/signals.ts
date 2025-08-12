export interface Signal {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage?: number;
  confidence: number;
  analysis: {
    technicalAnalysis: string;
    marketAnalysis: string;
    sentimentAnalysis: string;
    riskAssessment: string;
  };
  registeredAsIP: boolean;
  ipTokenId?: string;
  ipTransactionHash?: string;
  creator: {
    username: string;
    reputation: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSignalRequest {
  symbol?: string;
  aiModel: string;
  accountBalance?: number;
}

export interface ImproveSignalRequest {
  improvementType: 'entry-adjustment' | 'stop-loss-adjustment' | 'take-profit-adjustment' | 'analysis-enhancement';
  originalValue: number;
  improvedValue: number;
  reasoning: string;
}

export interface SignalImprovement {
  id: string;
  signalId: string;
  type: string;
  originalValue: number;
  improvedValue: number;
  reasoning: string;
  qualityScore: number;
  creator: {
    username: string;
    reputation: number;
  };
  createdAt: string;
}