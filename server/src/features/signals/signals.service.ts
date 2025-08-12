import { Signal } from './signals.model';
import { SignalDocument } from '@/shared/types/database.types';
import { tradingService } from '../trading/trading.service';
import { authService } from '../auth/auth.service';
import { logger } from '@/shared/utils/logger';
import { CustomError } from '@/shared/middleware/error.middleware';
import { env } from '@/shared/config/env';

export interface CreateSignalParams {
  symbol?: string;
  aiModel?: 'gpt-4o' | 'gpt-4o-mini';
  accountBalance?: number;
}

export interface ImproveSignalParams {
  improvementType: 'entry-adjustment' | 'stop-loss-adjustment' | 'take-profit-adjustment' | 'analysis-enhancement';
  originalValue: any;
  improvedValue: any;
  reasoning: string;
  newExpiryTime?: Date;
}

class SignalsService {
  // Platform-level automated signal generation
  async generatePlatformSignals(count: number = 50): Promise<SignalDocument[]> {
    try {
      logger.info('Starting platform signal generation', { targetCount: count });

      const { opportunities } = await tradingService.findTopOpportunities(undefined, {
        maxSymbols: 100,
        minVolume: 1000000,
        topCount: count
      });

      if (opportunities.length === 0) {
        logger.warn('No opportunities found for platform signal generation');
        return [];
      }

      const generatedSignals: SignalDocument[] = [];

      for (const opportunity of opportunities) {
        try {
          const tradingSignal = await tradingService.generateTradingSignal(
            opportunity.symbol,
            10000,
            undefined
          );

          const signal = new Signal({
            creator: 'platform',
            aiModel: 'gpt-4o-mini',
            ...tradingSignal,
            status: 'active',
            isPublic: true,
            isPlatformGenerated: true
          });

          await signal.save();

          // Auto-mint as IP NFT using platform wallet
          const { campService } = await import('../ip/camp.service');
          
          const baseIPRegistration = await campService.registerSignalAsIP(
            signal,
            null,
            env.PLATFORM_WALLET_PRIVATE_KEY,
            env.PLATFORM_WALLET_ADDRESS
          );
          
          signal.registeredAsIP = true;
          signal.ipTokenId = baseIPRegistration.tokenId;
          signal.ipTransactionHash = baseIPRegistration.transactionHash;
          await signal.save();

          generatedSignals.push(signal);
          
          logger.info('Platform signal generated and minted', { 
            signalId: signal._id,
            symbol: opportunity.symbol,
            winRate: opportunity.winRate,
            tokenId: baseIPRegistration.tokenId
          });

        } catch (error) {
          logger.error('Failed to generate platform signal', { error, symbol: opportunity.symbol });
          continue;
        }
      }

      logger.info('Platform signal generation completed', { 
        generated: generatedSignals.length,
        target: count 
      });

      return generatedSignals;
    } catch (error) {
      logger.error('Platform signal generation failed', { error });
      throw new CustomError('PLATFORM_SIGNAL_GENERATION_ERROR', 500, 'Failed to generate platform signals');
    }
  }

  // User-initiated signal creation (legacy support, requires credentials)
  async createAISignal(
    userId: string,
    params: CreateSignalParams
  ): Promise<SignalDocument> {
    try {
      const user = await authService.getUserById(userId);
      if (!user) {
        throw new CustomError('USER_NOT_FOUND', 404, 'User not found');
      }

      const credentials = await authService.getExchangeCredentials(userId, 'hyperliquid');
      if (!credentials) {
        throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Hyperliquid credentials required for user signal generation');
      }

      const accountBalance = params.accountBalance || (await tradingService.getAccountBalance(credentials.privateKey, credentials.walletAddress));
      
      const userSignals = await Signal.find({ 
        creator: userId,
        'performance.outcome': { $in: ['win', 'loss', 'breakeven'] }
      }).sort({ createdAt: -1 }).limit(50);

      const historicalPerformance = userSignals.length > 0 
        ? await tradingService.analyzePerformance(userSignals)
        : undefined;

      let selectedSymbol = params.symbol;
      if (!selectedSymbol) {
        const { opportunities } = await tradingService.findTopOpportunities(credentials.privateKey, {
          maxSymbols: 30,
          minVolume: 1000000,
          topCount: 1
        });
        
        if (opportunities.length === 0) {
          throw new CustomError('NO_OPPORTUNITIES', 400, 'No suitable trading opportunities found');
        }
        
        selectedSymbol = opportunities[0].symbol;
      }

      const tradingSignal = await tradingService.generateTradingSignal(
        selectedSymbol,
        accountBalance,
        credentials.privateKey,
        historicalPerformance
      );

      const signal = new Signal({
        creator: userId,
        aiModel: params.aiModel || 'gpt-4o-mini',
        ...tradingSignal,
        status: 'active',
        isPublic: true,
      });

      await signal.save();
      
      const { campService } = await import('../ip/camp.service');
      
      const baseIPRegistration = await campService.registerSignalAsIP(
        signal,
        null, 
        credentials.privateKey,
        credentials.walletAddress
      );
      
      signal.registeredAsIP = true;
      signal.ipTokenId = baseIPRegistration.tokenId;
      signal.ipTransactionHash = baseIPRegistration.transactionHash;
      await signal.save();

      return signal;
    } catch (error) {
      logger.error('Failed to create user AI signal', { error, userId, params });
      if (error instanceof CustomError) throw error;
      throw new CustomError('SIGNAL_CREATION_ERROR', 500, 'Could not create AI signal.');
    }
  }

  async getSignalById(signalId: string): Promise<SignalDocument | null> {
    return Signal.findById(signalId).populate('creator', 'username avatar reputation');
  }

  async getUserSignals(
    userId: string,
    filters: { status?: string; symbol?: string; outcome?: string; limit?: number; offset?: number; } = {}
  ): Promise<{ signals: SignalDocument[]; total: number }> {
    const query: any = { creator: userId };
    if (filters.status) query.status = filters.status;
    if (filters.symbol) query.symbol = filters.symbol.toUpperCase();
    if (filters.outcome) query['performance.outcome'] = filters.outcome;

    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;

    const [signals, total] = await Promise.all([
      Signal.find(query).populate('creator', 'username avatar').sort({ createdAt: -1 }).limit(limit).skip(offset),
      Signal.countDocuments(query)
    ]);

    return { signals, total };
  }

  async improveSignal(
    signalId: string,
    userId: string,
    improvement: ImproveSignalParams & { newExpiryTime?: Date }
  ): Promise<SignalDocument> {
    const signal = await Signal.findById(signalId);
    if (!signal) {
      throw new CustomError('SIGNAL_NOT_FOUND', 404, 'Signal not found');
    }
    if (signal.status !== 'active') {
      throw new CustomError('SIGNAL_NOT_ACTIVE', 400, 'Only active signals can be improved');
    }

    if (signal.improvements && signal.improvements.length > 0) {
      throw new CustomError('SIGNAL_ALREADY_IMPROVED', 400, 'This signal has already been improved by another user');
    }

    if (signal.creator.toString() === userId) {
      throw new CustomError('CANNOT_IMPROVE_OWN_SIGNAL', 400, 'You cannot improve your own signal');
    }

    const qualityScore = await this.assessImprovementQuality(signal, improvement);
    
    if (qualityScore < 50) {
      throw new CustomError('IMPROVEMENT_QUALITY_LOW', 400, 
        `Improvement quality too low (${qualityScore}/100). Please provide more substantive changes and reasoning.`);
    }

    const revenueShare = 0.6;

    signal.improvements.push({
      user: userId,
      ...improvement,
      qualityScore,
      revenueShare,
      performance: { outcome: 'pending', returnImprovement: 0 },
      registeredAsIP: false,
      createdAt: new Date(),
    });

    if (improvement.newExpiryTime) {
      signal.expiresAt = improvement.newExpiryTime;
    }

    await signal.save();
    return signal;
  }
  
  async getMarketplaceSignals(filters: {
    symbol?: string;
    side?: 'long' | 'short';
    minConfidence?: number;
    sortBy?: 'newest' | 'confidence' | 'quality';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ signals: any[]; total: number }> {
    const query: any = { 
      status: 'active',
      improvements: { $exists: true, $size: 1 }
    };

    if (filters.symbol) query.symbol = filters.symbol.toUpperCase();
    if (filters.side) query.side = filters.side;
    if (filters.minConfidence) query.confidence = { $gte: filters.minConfidence };

    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;

    let sortOption: any = { createdAt: -1 };
    if (filters.sortBy === 'confidence') sortOption = { confidence: -1 };
    if (filters.sortBy === 'quality') sortOption = { 'improvements.qualityScore': -1 };

    const [signals, total] = await Promise.all([
      Signal.find(query)
        .populate('creator', 'username avatar reputation')
        .populate('improvements.user', 'username avatar reputation')
        .sort(sortOption)
        .limit(limit)
        .skip(offset),
      Signal.countDocuments(query)
    ]);

    const previewSignals = signals.map(signal => ({
      id: signal._id,
      symbol: signal.symbol,
      side: signal.side,
      confidence: signal.confidence,
      qualityScore: signal.qualityScore,
      creator: signal.creator,
      improvements: signal.improvements.map((imp: any) => ({
        user: imp.user,
        improvementType: imp.improvementType,
        qualityScore: imp.qualityScore,
        revenueShare: imp.revenueShare,
        createdAt: imp.createdAt
      })),
      createdAt: signal.createdAt,
      expiresAt: signal.expiresAt,
      previewOnly: true
    }));

    return { signals: previewSignals, total };
  }

  async getFullSignalAccess(signalId: string, userId: string): Promise<SignalDocument | null> {
    const signal = await Signal.findById(signalId)
      .populate('creator', 'username avatar reputation')
      .populate('improvements.user', 'username avatar reputation');

    if (!signal) return null;

    const hasIPRegistration = signal.registeredAsIP || 
      signal.improvements?.some(imp => imp.registeredAsIP);

    if (!hasIPRegistration) {
      return signal;
    }

    const { campService } = await import('../ip/camp.service');
    const { authService } = await import('../auth/auth.service');

    try {
      const credentials = await authService.getExchangeCredentials(userId, 'hyperliquid');
      if (!credentials) {
        throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Wallet credentials required');
      }

      let hasAccess = false;
      if (signal.ipTokenId) {
        const accessInfo = await campService.checkAccess(signal.ipTokenId, credentials.walletAddress);
        hasAccess = accessInfo.hasAccess;
      }

      if (!hasAccess && signal.improvements) {
        for (const improvement of signal.improvements) {
          if (improvement.ipTokenId) {
            const accessInfo = await campService.checkAccess(improvement.ipTokenId, credentials.walletAddress);
            if (accessInfo.hasAccess) {
              hasAccess = true;
              break;
            }
          }
        }
      }

      if (!hasAccess) {
        throw new CustomError('ACCESS_DENIED', 403, 'Payment required for IP-registered signal');
      }

      return signal;
    } catch (error) {
      logger.error('Failed to verify signal access', { error, signalId, userId });
      throw error;
    }
  }

  async getImprovableSignals(filters: {
    symbol?: string;
    minConfidence?: number;
    sortBy?: 'newest' | 'confidence' | 'performance';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ signals: SignalDocument[]; total: number }> {
    const query: any = {
      isPublic: true,
      status: 'active',
      $or: [
        { improvements: { $exists: false } },
        { improvements: { $size: 0 } }
      ],
      expiresAt: { $gte: new Date() },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    };

    if (filters.symbol) query.symbol = filters.symbol.toUpperCase();
    if (filters.minConfidence) query.confidence = { $gte: filters.minConfidence };

    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;

    let sortOption: any = { createdAt: -1 };
    if (filters.sortBy === 'confidence') sortOption = { confidence: -1 };
    if (filters.sortBy === 'performance') sortOption = { 'performance.actualReturn': -1 };

    const [signals, total] = await Promise.all([
      Signal.find(query)
        .populate('creator', 'username avatar reputation')
        .sort(sortOption)
        .limit(limit)
        .skip(offset),
      Signal.countDocuments(query)
    ]);

    return { signals, total };
  }

  async getPublicSignals(filters: {
    symbol?: string;
    minConfidence?: number;
    sortBy?: 'newest' | 'confidence' | 'performance' | 'usage';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ signals: SignalDocument[]; total: number }> {
    const query: any = { isPublic: true, status: 'active' };

    if (filters.symbol) query.symbol = filters.symbol.toUpperCase();
    if (filters.minConfidence) query.confidence = { $gte: filters.minConfidence };

    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;

    let sortOption: any = { createdAt: -1 };
    if (filters.sortBy === 'confidence') sortOption = { confidence: -1 };
    if (filters.sortBy === 'performance') sortOption = { 'performance.actualReturn': -1 };
    if (filters.sortBy === 'usage') sortOption = { totalUsage: -1 };

    const [signals, total] = await Promise.all([
      Signal.find(query)
        .populate('creator', 'username avatar reputation')
        .sort(sortOption)
        .limit(limit)
        .skip(offset),
      Signal.countDocuments(query)
    ]);

    return { signals, total };
  }

  async expireOldSignals(): Promise<void> {
    const result = await Signal.updateMany(
      { status: 'active', expiresAt: { $lt: new Date() } },
      { 
        status: 'expired',
        'performance.outcome': 'breakeven',
        'performance.exitReason': 'expired',
        'performance.closedAt': new Date()
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} old signals.`);
    }
  }

  async updateSignalPerformance(signalId: string, performance: {
    outcome: 'win' | 'loss' | 'breakeven';
    actualReturn: number;
    executionPrice?: number;
    exitPrice?: number;
    exitReason?: 'take-profit' | 'stop-loss' | 'manual' | 'expired';
  }): Promise<SignalDocument> {
    const signal = await Signal.findById(signalId);
    if (!signal) {
      throw new CustomError('SIGNAL_NOT_FOUND', 404, 'Signal not found');
    }

    signal.performance = {
      ...signal.performance,
      ...performance,
      closedAt: new Date()
    };
    signal.status = 'executed';

    await signal.save();
    return signal;
  }

  async getUserPerformanceStats(userId: string): Promise<{
    totalSignals: number;
    winRate: number;
    avgReturn: number;
    totalReturn: number;
    bestSignal: number;
    worstSignal: number;
  }> {
    const signals = await Signal.find({ 
      creator: userId, 
      'performance.outcome': { $in: ['win', 'loss', 'breakeven'] }
    });

    if (signals.length === 0) {
      return {
        totalSignals: 0,
        winRate: 0,
        avgReturn: 0,
        totalReturn: 0,
        bestSignal: 0,
        worstSignal: 0
      };
    }

    const winningSignals = signals.filter(s => s.performance.outcome === 'win');
    const returns = signals.map(s => s.performance.actualReturn);
    const totalReturn = returns.reduce((sum, r) => sum + r, 0);

    return {
      totalSignals: signals.length,
      winRate: (winningSignals.length / signals.length) * 100,
      avgReturn: totalReturn / signals.length,
      totalReturn,
      bestSignal: Math.max(...returns),
      worstSignal: Math.min(...returns)
    };
  }

  async searchSignals(query: string, filters: {
    symbol?: string;
    minConfidence?: number;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ signals: SignalDocument[]; total: number }> {
    const searchQuery: any = {
      isPublic: true,
      status: 'active',
      $or: [
        { symbol: { $regex: query, $options: 'i' } },
        { 'analysis.technicalAnalysis': { $regex: query, $options: 'i' } },
        { 'analysis.marketAnalysis': { $regex: query, $options: 'i' } }
      ]
    };

    if (filters.symbol) searchQuery.symbol = filters.symbol.toUpperCase();
    if (filters.minConfidence) searchQuery.confidence = { $gte: filters.minConfidence };

    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;

    const [signals, total] = await Promise.all([
      Signal.find(searchQuery)
        .populate('creator', 'username avatar reputation')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset),
      Signal.countDocuments(searchQuery)
    ]);

    return { signals, total };
  }

  private async assessImprovementQuality(
    originalSignal: SignalDocument, 
    improvement: ImproveSignalParams
  ): Promise<number> {
    let score = 0;

    if (improvement.reasoning && improvement.reasoning.length >= 50) {
      score += 20;
      if (improvement.reasoning.length >= 100) score += 5;
    }

    const hasSubstantiveChanges = this.hasSubstantiveChanges(improvement);
    if (hasSubstantiveChanges) {
      score += 25;
    }

    const hasLogicalAdjustments = this.validateAdjustments(originalSignal, improvement);
    if (hasLogicalAdjustments) {
      score += 25;
    }

    const providesNewInsights = await this.checkForNewInsights(originalSignal, improvement);
    if (providesNewInsights) {
      score += 25;
    }

    const grammarScore = this.checkGrammarCoherence(improvement.reasoning);
    score += Math.min(10, grammarScore);

    return Math.min(100, Math.max(0, score));
  }

  private hasSubstantiveChanges(improvement: ImproveSignalParams): boolean {
    if (improvement.improvementType === 'entry-adjustment' && improvement.originalValue !== improvement.improvedValue) {
      const changePercent = Math.abs((improvement.improvedValue - improvement.originalValue) / improvement.originalValue);
      return changePercent > 0.005;
    }

    if (improvement.improvementType === 'stop-loss-adjustment' && improvement.originalValue !== improvement.improvedValue) {
      const changePercent = Math.abs((improvement.improvedValue - improvement.originalValue) / improvement.originalValue);
      return changePercent > 0.01;
    }

    if (improvement.improvementType === 'take-profit-adjustment' && improvement.originalValue !== improvement.improvedValue) {
      const changePercent = Math.abs((improvement.improvedValue - improvement.originalValue) / improvement.originalValue);
      return changePercent > 0.01;
    }

    if (improvement.improvementType === 'analysis-enhancement') {
      return typeof improvement.reasoning === 'string' && improvement.reasoning.length > 80;
    }

    return false;
  }

  private validateAdjustments(originalSignal: SignalDocument, improvement: ImproveSignalParams): boolean {
    const entryPrice = originalSignal.entryPrice;
    const stopLoss = originalSignal.stopLoss;
    const takeProfit = originalSignal.takeProfit;
    const side = originalSignal.side;

    if (improvement.improvementType === 'entry-adjustment') {
      const newEntry = improvement.improvedValue;
      
      if (side === 'long') {
        return newEntry > stopLoss && newEntry < takeProfit;
      } else {
        return newEntry < stopLoss && newEntry > takeProfit;
      }
    }

    if (improvement.improvementType === 'stop-loss-adjustment') {
      const newStop = improvement.improvedValue;
      
      if (side === 'long') {
        return newStop < entryPrice && newStop < takeProfit;
      } else {
        return newStop > entryPrice && newStop > takeProfit;
      }
    }

    if (improvement.improvementType === 'take-profit-adjustment') {
      const newTarget = improvement.improvedValue;
      
      if (side === 'long') {
        return newTarget > entryPrice && newTarget > stopLoss;
      } else {
        return newTarget < entryPrice && newTarget < stopLoss;
      }
    }

    return true;
  }

  private async checkForNewInsights(originalSignal: SignalDocument, improvement: ImproveSignalParams): Promise<boolean> {
    const reasoning = improvement.reasoning?.toLowerCase() || '';
    
    const insightKeywords = [
      'support', 'resistance', 'volume', 'momentum', 'trend', 'pattern',
      'fibonacci', 'ma', 'rsi', 'macd', 'bollinger', 'institutional',
      'liquidity', 'breakout', 'breakdown', 'consolidation', 'divergence'
    ];

    const keywordMatches = insightKeywords.filter(keyword => reasoning.includes(keyword)).length;
    
    return keywordMatches >= 2 && reasoning.length > 60;
  }

  private checkGrammarCoherence(text: string): number {
    if (!text || text.length < 20) return 0;
    
    let score = 5;
    
    if (text.includes('.') || text.includes('!') || text.includes('?')) score += 2;
    
    const wordCount = text.split(' ').length;
    if (wordCount >= 15) score += 2;
    
    if (!/^\s/.test(text) && !/\s$/.test(text.trim())) score += 1;
    
    return score;
  }
}

export const signalsService = new SignalsService();