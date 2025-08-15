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
  adminStatus?: 'pending_review' | 'approved_for_minting' | 'rejected' | 'minted';
  adminNotes?: string;
  improvements?: SignalImprovement[];
  creator: {
    id: string;
    username: string;
    reputation: number;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isExpired?: boolean;
  totalUsage?: number;
  aiModel?: string;
  status: 'active' | 'expired' | 'completed';
}

export interface CreateSignalRequest {
  symbol?: string;
  aiModel: string;
  accountBalance?: number;
}

export type NumericOrComposite =
  | number
  | null
  | undefined
  | {
      entryPrice?: number;
      stopLoss?: number;
      takeProfit?: number;
      [k: string]: number | undefined;
    };

export interface ImproveSignalRequest {
  improvementType:
    | 'entry-adjustment'
    | 'stop-loss-adjustment'
    | 'take-profit-adjustment'
    | 'analysis-enhancement';
  originalValue: NumericOrComposite;
  improvedValue: NumericOrComposite;
  reasoning: string;
}

export interface SignalImprovement {
  id: string;
  improvementType:
    | 'entry-adjustment'
    | 'stop-loss-adjustment'
    | 'take-profit-adjustment'
    | 'analysis-enhancement';
  originalValue: NumericOrComposite;
  improvedValue: NumericOrComposite;
  reasoning: string;
  qualityScore: number;
  registeredAsIP: boolean;
  ipTokenId?: string;
  ipTransactionHash?: string;
  creator: {
    id: string;
    username: string;
    reputation: number;
    avatar?: string;
  };
  createdAt: string;
}

export interface ImprovementQualityCheck {
  score: number;
  canMint: boolean;
  feedback: string[];
  requiredScore: number;
}

export interface SignalsResponse {
  signals: Signal[];
  total: number;
}
