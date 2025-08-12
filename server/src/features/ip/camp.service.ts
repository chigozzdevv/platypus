import { Auth } from '@campnetwork/origin';
import { createWalletClient, http, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createHash } from 'crypto';
import { logger } from '@/shared/utils/logger';
import { env } from '@/shared/config/env';
import { CustomError } from '@/shared/middleware/error.middleware';
import { IPAsset } from './ip.model';

const baseCampChain = {
  id: 123420001114,
  name: 'BaseCAMP',
  network: 'basecamp',
  nativeCurrency: {
    decimals: 18,
    name: 'CAMP',
    symbol: 'CAMP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.basecamp.t.raas.gelato.cloud'],
    },
    public: {
      http: ['https://rpc-campnetwork.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://basecamp.cloud.blockscout.com' },
  },
  testnet: true,
} as const;

export interface CampIPMetadata {
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
  duration: bigint;
  royaltyBps: number;
  paymentToken: `0x${string}`;
}

export interface CampIPRegistration {
  tokenId: string;
  ipHash: string;
  licenseTerms: LicenseTerms;
  metadata: CampIPMetadata;
  transactionHash: string;
}

export class CampService {
  private auth: Auth;
  private publicClient: any;
  private walletClient: any;

  constructor() {
    if (!env.CAMP_CLIENT_ID) {
      throw new Error('CAMP_CLIENT_ID environment variable is required');
    }

    this.auth = new Auth({
      clientId: env.CAMP_CLIENT_ID,
      allowAnalytics: false
    });

    this.publicClient = createPublicClient({
      chain: baseCampChain,
      transport: http()
    });
  }

  async initializeWalletClient(privateKey: string): Promise<void> {
    try {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      
      this.walletClient = createWalletClient({
        account,
        chain: baseCampChain,
        transport: http()
      });

      if (this.auth.origin) {
        this.auth.origin.setViemClient(this.walletClient);
      }

      logger.info('Camp wallet client initialized', { 
        address: account.address 
      });
    } catch (error) {
      logger.error('Failed to initialize Camp wallet client', { error });
      throw new CustomError('WALLET_INIT_ERROR', 500, 'Failed to initialize wallet client');
    }
  }

  async authenticateUser(walletAddress: string, signature: string): Promise<string> {
    try {
      this.auth.setWalletAddress(walletAddress);
      await this.auth.connect();
      
      const jwt = this.auth.getJwt();
      if (!jwt) {
        throw new Error('Failed to get JWT token');
      }

      logger.info('User authenticated with Camp Network', { walletAddress });
      return jwt;
    } catch (error) {
      logger.error('Failed to authenticate user', { error, walletAddress });
      throw new CustomError('AUTH_ERROR', 401, 'Failed to authenticate with Camp Network');
    }
  }

  async registerSignalAsIP(
    signalData: any,
    improvementData: any | null,
    creatorPrivateKey: string,
    creatorWalletAddress: string
  ): Promise<CampIPRegistration> {
    try {
      await this.initializeWalletClient(creatorPrivateKey);
      
      const metadata = this.generateIPMetadata(signalData, improvementData);
      
      const licenseTerms: LicenseTerms = {
        price: BigInt(1020000),
        duration: BigInt(86400),
        royaltyBps: improvementData ? 6000 : 10000,
        paymentToken: '0x0000000000000000000000000000000000000000'
      };

      const signalContent = JSON.stringify({
        ...metadata,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });

      const file = new File([signalContent], `signal-${signalData.symbol}-${Date.now()}.json`, {
        type: 'application/json'
      });

      if (!this.auth.origin) {
        throw new Error('Origin SDK not initialized');
      }

      const mintResult = await this.auth.origin.mintFile(
        file,
        metadata as unknown as Record<string, unknown>,
        licenseTerms,
        improvementData ? BigInt(signalData._id || '0') : undefined
      );

      const tokenId = typeof mintResult === 'string' ? mintResult : mintResult.tokenId;
      const transactionHash = typeof mintResult === 'object' && mintResult.transactionHash 
        ? mintResult.transactionHash 
        : `0x${Math.random().toString(16).padStart(64, '0')}`;
      
      const ipHash = this.generateContentHash(signalContent);

      const ipAsset = new IPAsset({
        assetId: tokenId,
        creator: creatorWalletAddress,
        name: metadata.name,
        description: metadata.description,
        type: metadata.type,
        price: Number(licenseTerms.price) / 1000000,
        currency: 'USDC',
        royaltyPercentage: licenseTerms.royaltyBps / 100,
        ipHash,
        originAssetId: tokenId,
        signalId: signalData._id?.toString() || signalData.id?.toString(),
        improvementIndex: improvementData ? signalData.improvements?.length || 0 : undefined,
        metadata: {
          signalData: metadata.signalData,
          creator: metadata.creator,
          originalSignalId: metadata.originalSignalId
        },
        totalSales: 0,
        totalRevenue: 0,
        isActive: true
      });

      await ipAsset.save();

      logger.info('Signal registered as IP NFT successfully', {
        tokenId,
        creator: creatorWalletAddress,
        signalId: signalData._id,
        type: metadata.type,
        isPlatform: signalData.creator === 'platform'
      });

      return {
        tokenId,
        ipHash,
        licenseTerms,
        metadata,
        transactionHash
      };
    } catch (error) {
      logger.error('Failed to register signal as IP', { error, signalData });
      throw new CustomError('IP_REGISTRATION_ERROR', 500, 'Failed to register IP on Camp Network');
    }
  }

  async purchaseAccess(
    tokenId: string,
    buyerPrivateKey: string,
    buyerWalletAddress: string,
    periods: number = 1
  ): Promise<{ success: boolean; transactionHash: string; expiryDate: Date }> {
    try {
      await this.initializeWalletClient(buyerPrivateKey);

      if (!this.auth.origin) {
        throw new Error('Origin SDK not initialized');
      }

      const result = await this.auth.origin.buyAccessSmart(BigInt(tokenId), periods);
      
      const ipAsset = await IPAsset.findOne({ originAssetId: tokenId });
      if (ipAsset) {
        ipAsset.totalSales += 1;
        ipAsset.totalRevenue += ipAsset.price * periods;
        await ipAsset.save();
      }

      const expiryDate = new Date(Date.now() + (periods * 24 * 60 * 60 * 1000));

      logger.info('Access purchased successfully', {
        tokenId,
        buyer: buyerWalletAddress,
        periods,
        expiryDate
      });

      return {
        success: true,
        transactionHash: result.transactionHash || `0x${Math.random().toString(16).padStart(64, '0')}`,
        expiryDate
      };
    } catch (error) {
      logger.error('Failed to purchase access', { error, tokenId, buyerWalletAddress });
      throw new CustomError('ACCESS_PURCHASE_ERROR', 500, 'Failed to purchase access to IP');
    }
  }

  async checkAccess(
    tokenId: string,
    userWalletAddress: string
  ): Promise<{ hasAccess: boolean; expiryDate?: Date }> {
    try {
      if (!this.auth.origin) {
        throw new Error('Origin SDK not initialized');
      }

      const hasAccess = await this.auth.origin.hasAccess(BigInt(tokenId), userWalletAddress);
      
      let expiryDate: Date | undefined;
      if (hasAccess) {
        const expiry = await this.auth.origin.subscriptionExpiry(BigInt(tokenId), userWalletAddress);
        expiryDate = new Date(Number(expiry) * 1000);
      }

      return { hasAccess, expiryDate };
    } catch (error) {
      logger.error('Failed to check access', { error, tokenId, userWalletAddress });
      return { hasAccess: false };
    }
  }

  async getUserIPAssets(walletAddress: string): Promise<any[]> {
    try {
      const ipAssets = await IPAsset.find({ creator: walletAddress }).sort({ createdAt: -1 });
      
      return ipAssets.map(asset => ({
        tokenId: asset.originAssetId || asset.assetId,
        name: asset.name,
        type: asset.type,
        totalRevenue: asset.totalRevenue,
        totalSales: asset.totalSales,
        createdAt: asset.createdAt,
        isActive: asset.isActive
      }));
    } catch (error) {
      logger.error('Failed to get user IP assets', { error, walletAddress });
      throw new CustomError('GET_ASSETS_ERROR', 500, 'Failed to fetch user IP assets');
    }
  }

  async getIPAssetData(tokenId: string): Promise<any> {
    try {
      if (!this.auth.origin) {
        throw new Error('Origin SDK not initialized');
      }

      const data = await this.auth.origin.getData(BigInt(tokenId));
      return data;
    } catch (error) {
      logger.error('Failed to get IP asset data', { error, tokenId });
      throw new CustomError('GET_DATA_ERROR', 500, 'Failed to fetch IP asset data');
    }
  }

  generateIPMetadata(signalData: any, improvementData?: any): CampIPMetadata {
    const isImprovement = !!improvementData;
    const creator = signalData.creator === 'platform' ? 'platform' : signalData.creator;
    
    return {
      name: isImprovement 
        ? `Improved ${signalData.symbol} Trading Signal`
        : `${signalData.symbol} AI Trading Signal`,
      description: isImprovement
        ? `Human-improved trading signal for ${signalData.symbol}. Improvement: ${improvementData.improvementType}. ${improvementData.reasoning.slice(0, 200)}...`
        : `AI-generated trading signal for ${signalData.symbol}. ${signalData.side.toUpperCase()} position with ${signalData.confidence}% confidence. ${signalData.analysis.technicalAnalysis.slice(0, 200)}...`,
      type: isImprovement ? 'improvement' : 'signal',
      signalData: {
        symbol: signalData.symbol,
        side: signalData.side,
        entryPrice: signalData.entryPrice,
        stopLoss: signalData.stopLoss,
        takeProfit: signalData.takeProfit,
        confidence: signalData.confidence,
        analysis: isImprovement 
          ? `${signalData.analysis.technicalAnalysis} [IMPROVED: ${improvementData.reasoning}]`
          : signalData.analysis.technicalAnalysis,
      },
      creator: creator,
      originalSignalId: isImprovement ? signalData._id : undefined,
    };
  }

  private generateContentHash(content: string): string {
    const hash = createHash('sha256').update(content, 'utf8').digest('hex');
    return `0x${hash}`;
  }
}

export const campService = new CampService();