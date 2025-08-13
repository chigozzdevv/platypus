import { useAuth } from '@campnetwork/origin/react';
import type { Signal, SignalImprovement } from '@/types/signals';

export interface CampMetadata {
  name: string;
  description: string;
  type: 'signal' | 'improvement';
  signalData: {
    symbol: string;
    side: 'long' | 'short';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    confidence: number;
    analysis: string;
  };
  creator: string;
  originalSignalId?: string;
}

export interface LicenseTerms {
  price: bigint;
  duration: number;
  royaltyBps: number;
  paymentToken: `0x${string}`;
}

export const campService = {
  async mintSignalAsParent(signal: Signal) {
    const { origin } = useAuth();
    if (!origin) throw new Error('Camp Network not connected');

    const metadata: CampMetadata = {
      name: `${signal.symbol} AI Trading Signal`,
      description: `AI-generated trading signal for ${signal.symbol}. ${signal.side.toUpperCase()} position with ${signal.confidence}% confidence. ${signal.analysis.technicalAnalysis.slice(0, 200)}...`,
      type: 'signal',
      signalData: {
        symbol: signal.symbol,
        side: signal.side,
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss ?? 0,
        takeProfit: signal.takeProfit ?? 0,
        confidence: signal.confidence,
        analysis: signal.analysis.technicalAnalysis,
      },
      creator: 'platform'
    };

    const licenseTerms: LicenseTerms = {
      price: BigInt('1000000000000000000'), // 1 CAMP
      duration: 86_400,
      royaltyBps: 10000,
      paymentToken: '0x0000000000000000000000000000000000000000',
    };

    const signalContent = JSON.stringify({ 
      ...metadata, 
      timestamp: new Date().toISOString(),
      version: '1.0'
    });
    
    const file = new File([signalContent], `signal-${signal.symbol}-${Date.now()}.json`, {
      type: 'application/json',
    });

    return await origin.mintFile(file, metadata as any, licenseTerms as any);
  },

  async mintImprovement(signal: Signal, improvement: SignalImprovement) {
    const { origin } = useAuth();
    if (!origin) throw new Error('Camp Network not connected');

    const metadata: CampMetadata = {
      name: `Improved ${signal.symbol} Trading Signal`,
      description: `Human-improved trading signal for ${signal.symbol}. Improvement: ${improvement.improvementType}. ${improvement.reasoning.slice(0, 200)}...`,
      type: 'improvement',
      signalData: {
        symbol: signal.symbol,
        side: signal.side,
        entryPrice: improvement.improvementType === 'entry-adjustment' ? improvement.improvedValue : signal.entryPrice,
        stopLoss: improvement.improvementType === 'stop-loss-adjustment' ? improvement.improvedValue : (signal.stopLoss ?? 0),
        takeProfit: improvement.improvementType === 'take-profit-adjustment' ? improvement.improvedValue : (signal.takeProfit ?? 0),
        confidence: signal.confidence,
        analysis: improvement.improvementType === 'analysis-enhancement' 
          ? `${signal.analysis.technicalAnalysis} [IMPROVED: ${improvement.reasoning}]`
          : signal.analysis.technicalAnalysis,
      },
      creator: improvement.creator.username,
      originalSignalId: signal.id
    };

    const licenseTerms: LicenseTerms = {
      price: BigInt('1000000000000000000'), // 1 CAMP
      duration: 86_400,
      royaltyBps: 6000, // 60% to improver
      paymentToken: '0x0000000000000000000000000000000000000000',
    };

    const parentId = BigInt(signal.ipTokenId!);
    
    const improvementContent = JSON.stringify({ 
      originalSignal: signal, 
      improvement, 
      metadata,
      timestamp: new Date().toISOString()
    });
    
    const file = new File([improvementContent], `improvement-${signal.symbol}-${Date.now()}.json`, {
      type: 'application/json',
    });

    return await origin.mintFile(file, metadata as any, licenseTerms as any, parentId);
  },

  async checkAccess(tokenId: string): Promise<boolean> {
    const { origin, viem } = useAuth();
    if (!origin || !viem) return false;

    try {
      const accounts = await viem.request({ method: 'eth_accounts' });
      const userAddress = accounts[0] as `0x${string}`;
      return await origin.hasAccess(tokenId as `0x${string}`, BigInt(userAddress));
    } catch (error) {
      console.error('Access check failed:', error);
      return false;
    }
  },

  async purchaseAccess(tokenId: string, periods: number = 1) {
    const { origin } = useAuth();
    if (!origin) throw new Error('Camp Network not connected');

    return await origin.buyAccessSmart(BigInt(tokenId), periods);
  },

  async checkSignalAccess(signal: Signal): Promise<boolean> {
    if (!signal.registeredAsIP || !signal.ipTokenId) {
      return true;
    }

    const { viem } = useAuth();
    if (!viem) return false;

    try {
      return await this.checkAccess(signal.ipTokenId);
    } catch (error) {
      console.error('Signal access check failed:', error);
      return false;
    }
  },

  async getRoyaltyBalance(): Promise<string> {
    const { origin, viem } = useAuth();
    if (!origin || !viem) throw new Error('Camp Network not connected');

    // This would need to be implemented based on Camp Network's royalty system
    // For now, return placeholder
    return '0';
  },

  async claimRoyalties() {
    const { origin } = useAuth();
    if (!origin) throw new Error('Camp Network not connected');

    throw new Error('Royalty claiming not yet implemented in Camp Network SDK');
  }
};