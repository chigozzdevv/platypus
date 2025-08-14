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
  image?: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface LicenseTerms {
  price: bigint;
  duration: number;
  royaltyBps: number;
  paymentToken: `0x${string}`;
}

let _origin: any | null = null;
let _viem: any | null = null;

export function setCampClients(clients: { origin: any; viem: any }) {
  _origin = clients.origin;
  _viem = clients.viem;
}

async function uploadToIPFS(content: any, fileName: string): Promise<string> {
  const PINATA_JWT = import.meta.env.VITE__PUBLIC_PINATA_JWT;
  
  if (!PINATA_JWT) {
    throw new Error('PINATA_JWT is not configured');
  }

  try {
    const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const file = new File([fileContent], fileName, { type: 'application/json' });
    
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: 'camp-signal',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IPFS upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    
    return ipfsUrl;
  } catch (error) {
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const campService = {
  async mintSignalAsParent(signal: Signal) {
    if (!_origin) {
      throw new Error('Camp Network not connected');
    }

    try {
      const signalMetadata = {
        name: `${signal.symbol} AI Trading Signal`,
        description: `AI-generated trading signal for ${signal.symbol}. ${signal.side.toUpperCase()} position with ${signal.confidence}% confidence. ${signal.analysis.technicalAnalysis.slice(0, 200)}...`,
        type: 'signal' as const,
        signalData: {
          symbol: signal.symbol,
          side: signal.side,
          entryPrice: signal.entryPrice,
          stopLoss: signal.stopLoss ?? 0,
          takeProfit: signal.takeProfit ?? 0,
          confidence: signal.confidence,
          analysis: signal.analysis.technicalAnalysis,
          marketAnalysis: signal.analysis.marketAnalysis,
          sentimentAnalysis: signal.analysis.sentimentAnalysis,
          riskAssessment: signal.analysis.riskAssessment,
          timestamp: new Date().toISOString()
        },
        creator: 'platform',
        version: '1.0',
        attributes: [
          {
            trait_type: 'Symbol',
            value: signal.symbol
          },
          {
            trait_type: 'Side',
            value: signal.side.toUpperCase()
          },
          {
            trait_type: 'Confidence',
            value: signal.confidence
          },
          {
            trait_type: 'Entry Price',
            value: signal.entryPrice
          },
          {
            trait_type: 'AI Model',
            value: signal.aiModel || 'gpt-4o'
          }
        ]
      };

      const ipfsUrl = await uploadToIPFS(
        signalMetadata,
        `signal-${signal.symbol}-${Date.now()}.json`
      );

      const metadata: CampMetadata = {
        name: signalMetadata.name,
        description: signalMetadata.description,
        type: signalMetadata.type,
        signalData: {
          symbol: signal.symbol,
          side: signal.side,
          entryPrice: signal.entryPrice,
          stopLoss: signal.stopLoss ?? 0,
          takeProfit: signal.takeProfit ?? 0,
          confidence: signal.confidence,
          analysis: signal.analysis.technicalAnalysis
        },
        creator: 'platform',
        image: ipfsUrl,
        external_url: ipfsUrl,
        attributes: signalMetadata.attributes
      };

      const licenseTerms: LicenseTerms = {
        price: BigInt('1000000000000000000'),
        duration: 86400,
        royaltyBps: 10000,
        paymentToken: '0x0000000000000000000000000000000000000000' as `0x${string}`
      };

      const contentResponse = await fetch(ipfsUrl);
      if (!contentResponse.ok) {
        throw new Error(`Failed to fetch content from IPFS: ${contentResponse.statusText}`);
      }
      
      const blob = await contentResponse.blob();
      const mintFile = new File(
        [blob],
        `signal-${signal.symbol}.json`,
        { type: 'application/json' }
      );

      const result = await _origin.mintFile(
        mintFile,
        metadata as any,
        licenseTerms as any
      );
      
      return result;
    } catch (error) {
      throw new Error(
        `Failed to mint signal: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  async mintImprovement(signal: Signal, improvement: SignalImprovement) {
    if (!_origin) {
      throw new Error('Camp Network not connected');
    }

    try {
      const improvementMetadata = {
        name: `Improved ${signal.symbol} Trading Signal`,
        description: `Human-improved trading signal for ${signal.symbol}. Improvement: ${improvement.improvementType}. ${improvement.reasoning.slice(0, 200)}...`,
        type: 'improvement' as const,
        signalData: {
          symbol: signal.symbol,
          side: signal.side,
          entryPrice: improvement.improvementType === 'entry-adjustment' 
            ? improvement.improvedValue 
            : signal.entryPrice,
          stopLoss: improvement.improvementType === 'stop-loss-adjustment' 
            ? improvement.improvedValue 
            : signal.stopLoss ?? 0,
          takeProfit: improvement.improvementType === 'take-profit-adjustment' 
            ? improvement.improvedValue 
            : signal.takeProfit ?? 0,
          confidence: signal.confidence,
          analysis: improvement.improvementType === 'analysis-enhancement'
            ? `${signal.analysis.technicalAnalysis} [IMPROVED: ${improvement.reasoning}]`
            : signal.analysis.technicalAnalysis,
          improvementReasoning: improvement.reasoning,
          timestamp: new Date().toISOString()
        },
        creator: improvement.creator.username,
        originalSignalId: signal.id,
        version: '1.0',
        attributes: [
          {
            trait_type: 'Symbol',
            value: signal.symbol
          },
          {
            trait_type: 'Improvement Type',
            value: improvement.improvementType
          },
          {
            trait_type: 'Original Signal',
            value: signal.id
          },
          {
            trait_type: 'Improved By',
            value: improvement.creator.username
          }
        ]
      };

      const ipfsUrl = await uploadToIPFS(
        improvementMetadata,
        `improvement-${signal.symbol}-${Date.now()}.json`
      );

      const metadata: CampMetadata = {
        name: improvementMetadata.name,
        description: improvementMetadata.description,
        type: improvementMetadata.type,
        signalData: {
          symbol: signal.symbol,
          side: signal.side,
          entryPrice: improvement.improvementType === 'entry-adjustment' 
            ? improvement.improvedValue 
            : signal.entryPrice,
          stopLoss: improvement.improvementType === 'stop-loss-adjustment' 
            ? improvement.improvedValue 
            : signal.stopLoss ?? 0,
          takeProfit: improvement.improvementType === 'take-profit-adjustment' 
            ? improvement.improvedValue 
            : signal.takeProfit ?? 0,
          confidence: signal.confidence,
          analysis: improvement.improvementType === 'analysis-enhancement'
            ? `${signal.analysis.technicalAnalysis} [IMPROVED: ${improvement.reasoning}]`
            : signal.analysis.technicalAnalysis
        },
        creator: improvement.creator.username,
        originalSignalId: signal.id,
        image: ipfsUrl,
        external_url: ipfsUrl,
        attributes: improvementMetadata.attributes
      };

      const licenseTerms: LicenseTerms = {
        price: BigInt('1000000000000000000'),
        duration: 86400,
        royaltyBps: 6000,
        paymentToken: '0x0000000000000000000000000000000000000000' as `0x${string}`
      };

      const parentId = BigInt(signal.ipTokenId!);

      const contentResponse = await fetch(ipfsUrl);
      const blob = await contentResponse.blob();
      const mintFile = new File(
        [blob],
        `improvement-${signal.symbol}.json`,
        { type: 'application/json' }
      );

      const result = await _origin.mintFile(
        mintFile,
        metadata as any,
        licenseTerms as any,
        parentId
      );

      return result;
    } catch (error) {
      throw new Error(
        `Failed to mint improvement: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  async checkAccess(tokenId: string): Promise<boolean> {
    if (!_origin || !_viem) return false;
    
    try {
      const accounts = await _viem.request({ method: 'eth_accounts' });
      const userAddress = accounts?.[0] as `0x${string}`;
      if (!userAddress) return false;
      
      return await _origin.hasAccess(BigInt(tokenId), userAddress);
    } catch {
      return false;
    }
  },

  async purchaseAccess(tokenId: string, periods: number = 1) {
    if (!_origin) throw new Error('Camp Network not connected');
    return await _origin.buyAccessSmart(BigInt(tokenId), periods);
  },

  async checkSignalAccess(signal: Signal): Promise<boolean> {
    if (!signal.registeredAsIP || !signal.ipTokenId) return true;
    return await this.checkAccess(signal.ipTokenId);
  },

  async getRoyaltyBalance(): Promise<string> {
    if (!_origin || !_viem) throw new Error('Camp Network not connected');
    return '0';
  },

  async claimRoyalties() {
    if (!_origin) throw new Error('Camp Network not connected');
    throw new Error('Royalty claiming not yet implemented in Camp Network SDK');
  }
};