import { hyperliquidService } from './hyperliquid/hyperliquid.service';
import { openaiClient } from './agent/openai-client';
import { logger } from '@/shared/utils/logger';
import { CustomError } from '@/shared/middleware/error.middleware';
import { TradingSignal, MarketData, HistoricalPerformance, MarketOpportunity, PatternRecognition, ScanSummary, ExecuteTradeParams } from './trading.types';

class TradingService {
  async generateTradingSignal(
    symbol: string,
    accountBalance?: number,
    privateKey?: string, 
    historicalPerformance?: HistoricalPerformance
  ): Promise<TradingSignal> {
    try {

      const defaultBalance = accountBalance || 10000; // Platform reference balance
      const client = privateKey ? hyperliquidService.getOrCreateClient(privateKey) : hyperliquidService.createClient();
      
      const allMids = await client.info.getAllMids();
      const currentPrice = hyperliquidService.getPriceFromAllMids(allMids, symbol);
      
      if (currentPrice === 0) {
        throw new CustomError('MARKET_UNAVAILABLE', 400, `Market for ${symbol} is not available or not liquid`);
      }
      
      const assetSpecs = await hyperliquidService.getAssetSpecs(client, symbol);
      if (!assetSpecs || assetSpecs.lotSize <= 0) {
        throw new CustomError('INVALID_SYMBOL', 400, `Symbol ${symbol} is not valid for trading`);
      }
      
      // Use public market data methods (no privateKey needed)
      const platformKey: string | undefined = undefined;
      const marketData = await this.getEnhancedMarketData(platformKey, symbol);
      
      if (marketData.volume24h < 100000) {
        logger.warn(`Low volume warning for ${symbol}: ${marketData.volume24h.toLocaleString()}`);
      }
      
      if (marketData.avgVolatility > 50) {
        logger.warn(`High volatility warning for ${symbol}: ${marketData.avgVolatility.toFixed(1)}%`);
      }
      
      const fearGreedIndex = await this.getFearGreedIndex();
      const patterns = await this.recognizePatterns(platformKey, symbol);
      
      const prompt = this.buildAdvancedAnalysisPrompt(
        symbol,
        marketData,
        defaultBalance, // Use defaultBalance instead of accountBalance
        fearGreedIndex,
        patterns,
        historicalPerformance
      );
      
      const analysis = await openaiClient.generateStructuredCompletion<{
        signal: TradingSignal;
        reasoning: string;
      }>(
        [{ role: 'user', content: prompt }],
        {}, 
        'gpt-4o',
        0.1
      );

      // Apply risk management to signal levels (not position sizing)
      const riskManagedSignal = this.applySignalRiskManagement(analysis.signal, marketData);
      
      const qualityScore = this.calculateSignalQuality(riskManagedSignal, marketData, patterns);
      
      if (qualityScore.score < 60) {
        throw new CustomError('SIGNAL_QUALITY_LOW', 400, 
          `Signal quality too low (${qualityScore.score}/100): ${qualityScore.reasons.join(', ')}`);
      }
      
      const finalSignal = {
        ...riskManagedSignal,
        qualityScore: qualityScore.score,
        qualityReasons: qualityScore.reasons,
      };
      
      logger.info('Trading signal generated', {
        symbol,
        winRate: marketData.winRate,
        confidence: finalSignal.confidence,
        side: finalSignal.side,
        platform: !privateKey, // Log if this is a platform-generated signal
      });

      return {
        ...finalSignal,
        symbol: symbol.toUpperCase(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        marketConditions: {
          fearGreedIndex,
          volatility: marketData.volatility,
          volume24h: marketData.volume24h,
          priceChange24h: marketData.priceChange24h,
        },
      };
    } catch (error) {
      logger.error('Failed to generate trading signal', { error, symbol });
      throw new CustomError('SIGNAL_GENERATION_FAILED', 500, 'Failed to generate trading signal from AI');
    }
  }

  async calculatePrecisePositionSize(
    signal: TradingSignal,
    privateKey: string,
    walletAddress: string,
    riskPercentage: number = 2,
    maxLeverage: number = 5
  ): Promise<{
    positionSize: number;
    positionValue: number;
    marginRequired: number;
    riskAmount: number;
    leverage: number;
    validation: {
      canExecute: boolean;
      warnings: string[];
      errors: string[];
    };
  }> {
    try {
      const client = hyperliquidService.getOrCreateClient(privateKey, walletAddress);
      
      const accountInfo = await client.info.perpetuals.getClearinghouseState(walletAddress);
      const accountValue = parseFloat(accountInfo.marginSummary.accountValue);
      const usedMargin = parseFloat(accountInfo.marginSummary.totalMarginUsed);
      const availableMargin = accountValue - usedMargin;
      
      const assetSpecs = await hyperliquidService.getAssetSpecs(client, signal.symbol);
      
      const allMids = await client.info.getAllMids();
      const currentPrice = hyperliquidService.getPriceFromAllMids(allMids, signal.symbol);
      
      if (currentPrice === 0) {
        throw new CustomError('PRICE_ERROR', 400, `Cannot get current price for ${signal.symbol}`);
      }

      const warnings: string[] = [];
      const errors: string[] = [];
      let canExecute = true;

      const entryPrice = Math.abs(signal.entryPrice - currentPrice) / currentPrice < 0.05 
        ? signal.entryPrice 
        : currentPrice;
      
      if (signal.entryPrice !== entryPrice) {
        warnings.push(`Entry price adjusted from ${signal.entryPrice} to ${entryPrice} (market moved)`);
      }

      const safeLeverage = Math.min(signal.leverage, maxLeverage, 5);
      
      const maxRiskPercentage = Math.min(riskPercentage, accountValue < 100 ? 5 : 2);
      const riskAmount = (accountValue * maxRiskPercentage) / 100;
      
      const stopDistance = Math.abs(entryPrice - signal.stopLoss);
      
      if (stopDistance < entryPrice * 0.005) {
        warnings.push(`Stop loss is very close (${(stopDistance/entryPrice*100).toFixed(2)}%) - may cause slippage issues`);
      }
      
      const rawPositionSize = riskAmount / stopDistance;
      
      const positionSize = this.preciseRoundToLotSize(rawPositionSize, assetSpecs.lotSize);
      const positionValue = this.preciseCalculation(positionSize * entryPrice);
      
      const theoreticalMargin = positionValue / safeLeverage;
      const marginRequired = theoreticalMargin * 1.05;

      if (positionSize <= 0) {
        errors.push('Position size is zero or negative');
        canExecute = false;
      }

      if (positionSize < assetSpecs.lotSize) {
        errors.push(`Position size ${positionSize} is below minimum lot size ${assetSpecs.lotSize}`);
        canExecute = false;
      }

      if (positionValue < assetSpecs.minOrderValue) {
        errors.push(`Position value ${positionValue} is below minimum order value ${assetSpecs.minOrderValue}`);
        canExecute = false;
      }

      if (marginRequired > availableMargin) {
        errors.push(`Required margin ${marginRequired.toFixed(2)} exceeds available margin ${availableMargin.toFixed(2)}`);
        canExecute = false;
      }

      if (marginRequired > availableMargin * 0.95) {
        warnings.push('Using >95% of available margin - high risk');
      }

      // Check if stop loss is reasonable
      const stopDistancePercent = (stopDistance / entryPrice) * 100;
      if (stopDistancePercent > 10) {
        warnings.push(`Stop loss is ${stopDistancePercent.toFixed(1)}% away - very high risk`);
      }

      if (signal.expiresAt && new Date() > signal.expiresAt) {
        errors.push('Signal has expired');
        canExecute = false;
      }

      const safetyCheck = this.validatePositionSafety(
        positionSize,
        entryPrice,
        signal.stopLoss,
        safeLeverage,
        availableMargin
      );
      
      if (!safetyCheck.isValid) {
        errors.push(...safetyCheck.reasons);
        canExecute = false;
      }

      if (isNaN(positionSize) || isNaN(marginRequired) || isNaN(positionValue)) {
        errors.push('Calculation error - invalid numbers detected');
        canExecute = false;
      }

      logger.info('Position size calculated', {
        symbol: signal.symbol,
        positionSize,
        marginRequired,
        riskAmount,
        leverage: safeLeverage,
        canExecute,
        warnings: warnings.length,
        errors: errors.length,
      });

      return {
        positionSize,
        positionValue,
        marginRequired,
        riskAmount,
        leverage: safeLeverage,
        validation: {
          canExecute,
          warnings,
          errors,
        },
      };
    } catch (error) {
      logger.error('Position size calculation failed', { error, signal: signal.symbol });
      throw new CustomError('POSITION_CALC_ERROR', 500, 'Failed to calculate position size');
    }
  }

  async executePreciseTrade(
    signal: TradingSignal,
    privateKey: string,
    walletAddress: string,
    riskPercentage: number = 2,
    maxLeverage: number = 5,
    orderType: 'market' | 'limit' = 'limit'
  ): Promise<{
    success: boolean;
    orderId?: string;
    executedPrice?: number;
    executedSize?: number;
    message: string;
    executionDetails: any;
  }> {
    try {
      const positionCalc = await this.calculatePrecisePositionSize(
        signal,
        privateKey,
        walletAddress,
        riskPercentage,
        maxLeverage
      );

      if (!positionCalc.validation.canExecute) {
        return {
          success: false,
          message: `Cannot execute trade: ${positionCalc.validation.errors.join(', ')}`,
          executionDetails: {
            errors: positionCalc.validation.errors,
            warnings: positionCalc.validation.warnings,
          },
        };
      }

      const client = hyperliquidService.getOrCreateClient(privateKey, walletAddress);
      const coin = hyperliquidService.getApiCoin(signal.symbol);
      const assetSpecs = await hyperliquidService.getAssetSpecs(client, signal.symbol);

      try {
        await client.exchange.updateLeverage(coin, "cross", positionCalc.leverage);
      } catch (leverageError) {
        logger.warn('Failed to set leverage', { leverageError, symbol: signal.symbol });
      }

      const allMids = await client.info.getAllMids();
      const currentPrice = hyperliquidService.getPriceFromAllMids(allMids, signal.symbol);
      
      if (currentPrice === 0) {
        return {
          success: false,
          message: 'Cannot execute: Current price unavailable',
          executionDetails: { error: 'Price feed unavailable' },
        };
      }

      const priceMovement = Math.abs(currentPrice - signal.entryPrice) / signal.entryPrice;
      if (priceMovement > 0.05) {
        return {
          success: false,
          message: `Price moved ${(priceMovement*100).toFixed(2)}% since signal - canceling for safety`,
          executionDetails: { 
            priceMovement,
            originalPrice: signal.entryPrice,
            currentPrice 
          },
        };
      }

      const freshAccountInfo = await client.info.perpetuals.getClearinghouseState(walletAddress);
      const currentAvailableMargin = parseFloat(freshAccountInfo.marginSummary.accountValue) - 
                                   parseFloat(freshAccountInfo.marginSummary.totalMarginUsed);
      
      if (positionCalc.marginRequired > currentAvailableMargin) {
        return {
          success: false,
          message: 'Insufficient margin after rechecking account',
          executionDetails: { 
            required: positionCalc.marginRequired,
            available: currentAvailableMargin 
          },
        };
      }

      const orderRequest: any = {
        coin,
        is_buy: signal.side === "long",
        sz: this.preciseCalculation(positionCalc.positionSize),
        reduce_only: false,
      };

      let executionPrice: number;

      if (orderType === "limit") {
        executionPrice = signal.entryPrice;
        
        const priceDistance = Math.abs(executionPrice - currentPrice) / currentPrice;
        if (priceDistance > 0.02) {
          executionPrice = signal.side === "long" 
            ? currentPrice * 1.001
            : currentPrice * 0.999;
        }

        const preciseLimitPrice = hyperliquidService.roundToTickSize(executionPrice, assetSpecs.tickSize);
        
        if (Math.abs(preciseLimitPrice - executionPrice) / executionPrice > 0.001) {
          logger.warn(`Limit price adjusted due to tick size: ${executionPrice} -> ${preciseLimitPrice}`);
        }
        
        orderRequest.limit_px = preciseLimitPrice;
        orderRequest.order_type = { limit: { tif: "Gtc" } };
      } else {
        const slippageBuffer = 0.001;
        executionPrice = signal.side === "long" 
          ? currentPrice * (1 + slippageBuffer)
          : currentPrice * (1 - slippageBuffer);
        
        const preciseMarketPrice = hyperliquidService.roundToTickSize(executionPrice, assetSpecs.tickSize);
        
        orderRequest.limit_px = preciseMarketPrice;
        orderRequest.order_type = { limit: { tif: "Ioc" } };
      }

      if (orderRequest.sz <= 0 || !orderRequest.limit_px || orderRequest.limit_px <= 0) {
        return {
          success: false,
          message: 'Invalid order parameters calculated',
          executionDetails: { orderRequest },
        };
      }

      logger.info('Executing precise trade', {
        symbol: signal.symbol,
        side: signal.side,
        size: positionCalc.positionSize,
        price: orderRequest.limit_px,
        leverage: positionCalc.leverage,
        orderType,
      });

      const orderResponse = await client.exchange.placeOrder({
        orders: [orderRequest],
        grouping: "na",
      });

      if (orderResponse.status !== "ok") {
        return {
          success: false,
          message: `Order failed: ${JSON.stringify(orderResponse)}`,
          executionDetails: {
            orderResponse,
            positionCalc,
          },
        };
      }

      const orderData = orderResponse.response?.data?.statuses?.[0];
      
      if (orderData?.error) {
        return {
          success: false,
          message: `Order error: ${orderData.error}`,
          executionDetails: {
            orderData,
            positionCalc,
          },
        };
      }

      if (orderData?.filled) {
        const filled = orderData.filled;
        logger.info('Trade executed successfully', {
          symbol: signal.symbol,
          size: filled.totalSz,
          price: filled.avgPx,
          orderId: filled.oid,
        });

        return {
          success: true,
          orderId: filled.oid?.toString(),
          executedPrice: parseFloat(filled.avgPx || "0"),
          executedSize: parseFloat(filled.totalSz || "0"),
          message: `Trade executed successfully. Size: ${filled.totalSz}, Price: ${filled.avgPx}`,
          executionDetails: {
            filled,
            positionCalc,
            warnings: positionCalc.validation.warnings,
          },
        };
      } else if (orderData?.resting) {
        return {
          success: true,
          orderId: orderData.resting.oid?.toString(),
          message: `Limit order placed successfully, waiting for fill. Size: ${positionCalc.positionSize}`,
          executionDetails: {
            resting: orderData.resting,
            positionCalc,
            warnings: positionCalc.validation.warnings,
          },
        };
      } else {
        return {
          success: false,
          message: 'Order placed but status unclear',
          executionDetails: {
            orderData,
            positionCalc,
          },
        };
      }

    } catch (error) {
      logger.error('Precise trade execution failed', { error, signal: signal.symbol });
      return {
        success: false,
        message: `Trade execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionDetails: { error },
      };
    }
  }

  async findTopOpportunities(
    privateKey?: string,
    params: { maxSymbols?: number; minVolume?: number; topCount?: number; } = {}
  ): Promise<{ opportunities: MarketOpportunity[]; scanSummary: ScanSummary; }> {
    const { maxSymbols = 30, minVolume = 2000000, topCount = 5 } = params;
    
    try {
      console.log(`Scanning ${maxSymbols} symbols for top ${topCount} opportunities...`);
      
      const client = privateKey ? hyperliquidService.getOrCreateClient(privateKey) : hyperliquidService.createClient();
      
      const [meta, allMids, fearGreedIndex] = await Promise.all([
        client.info.perpetuals.getMeta(),
        client.info.getAllMids(),
        this.getFearGreedIndex()
      ]);
      
      const allSymbols = meta.universe.slice(0, maxSymbols).map((asset: any) => asset.name);
      const opportunities: MarketOpportunity[] = [];
      
      for (const coin of allSymbols) {
        try {
          const displaySymbol = hyperliquidService.getDisplaySymbol(coin);
          const price = hyperliquidService.getPriceFromAllMids(allMids, displaySymbol);
          
          if (price === 0) continue;
          
          const marketData = await hyperliquidService.getEnhancedMarketData(client, coin);
          
          if (marketData.volume24h < minVolume) continue;
          
          // Convert to full MarketData for scoring
          const fullMarketData: MarketData = {
            ...marketData,
            symbol: displaySymbol,
            priceChange24h: marketData.change24h,
            high24h: 0, // Not available in this context
            low24h: 0,  // Not available in this context
            volatility: marketData.avgVolatility,
            marketCap: marketData.price * 1000000, // Approximate
          };
          
          const score = this.calculateAdvancedOpportunityScore(fullMarketData, fearGreedIndex);
          
          if (score > 55) {
            const setup = this.analyzeSetup(marketData.rsi, marketData.change24h, fearGreedIndex, marketData.winRate);
            
            opportunities.push({
              symbol: displaySymbol,
              score,
              price: marketData.price,
              change24h: marketData.change24h,
              volume: marketData.volume24h,
              rsi: Math.round(marketData.rsi * 100) / 100,
              winRate: Math.round(marketData.winRate * 100) / 100,
              sharpeRatio: Math.round(marketData.sharpeRatio * 100) / 100,
              maxDrawdown: Math.round(marketData.maxDrawdown * 100) / 100,
              signals: this.generateAdvancedSignals(fullMarketData, fearGreedIndex),
              setup,
            });
          }
        } catch (error) {
          logger.warn(`Error analyzing ${coin} for opportunities`, { error });
          continue;
        }
      }
      
      // Sort by win rate first, then by score - WIN RATE IS KING!
      opportunities.sort((a, b) => {
        const winRateDiff = b.winRate - a.winRate;
        return Math.abs(winRateDiff) > 5 ? winRateDiff : b.score - a.score;
      });
      
      const topOpportunities = opportunities.slice(0, topCount);
      const avgWinRate = opportunities.length > 0 ? opportunities.reduce((sum, opp) => sum + opp.winRate, 0) / opportunities.length : 0;
      
      console.log(`Found ${opportunities.length} opportunities, top win rate: ${topOpportunities[0]?.winRate.toFixed(1)}%`);
      
      return {
        opportunities: topOpportunities,
        scanSummary: {
          totalScanned: allSymbols.length,
          opportunitiesFound: opportunities.length,
          avgWinRate: Math.round(avgWinRate * 100) / 100,
          topWinRate: topOpportunities.length > 0 ? topOpportunities[0].winRate : 0,
        },
      };
    } catch (error) {
      logger.error('Failed to find top opportunities', { error });
      throw new CustomError('OPPORTUNITY_SCAN_FAILED', 500, 'Failed to scan for market opportunities');
    }
  }

  async getAccountBalance(privateKey: string, walletAddress: string): Promise<number> {
    try {
      const client = hyperliquidService.getOrCreateClient(privateKey, walletAddress);
      const accountInfo = await client.info.perpetuals.getClearinghouseState(walletAddress);
      return parseFloat(accountInfo.marginSummary.accountValue);
    } catch (error) {
      logger.error('Failed to get account balance', { error, walletAddress });
      throw new CustomError('ACCOUNT_BALANCE_ERROR', 500, 'Failed to fetch account balance');
    }
  }

  async analyzePerformance(signals: any[]): Promise<HistoricalPerformance> {
    const completedSignals = signals.filter(s => 
      s.performance?.outcome && s.performance.outcome !== 'pending'
    );

    if (completedSignals.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
      };
    }

    const winningTrades = completedSignals.filter(s => s.performance.outcome === 'win');
    const winRate = (winningTrades.length / completedSignals.length) * 100;
    
    const returns = completedSignals.map(s => s.performance.actualReturn || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev === 0 ? 0 : avgReturn / stdDev;
    
    let maxDrawdown = 0;
    let peak = 0;
    let cumulativeReturn = 0;
    
    for (const returnVal of returns) {
      cumulativeReturn += returnVal;
      if (cumulativeReturn > peak) peak = cumulativeReturn;
      const drawdown = peak - cumulativeReturn;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Calculate consecutive streaks
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    for (const signal of completedSignals) {
      if (signal.performance.outcome === 'win') {
        currentWinStreak++;
        currentLossStreak = 0;
        consecutiveWins = Math.max(consecutiveWins, currentWinStreak);
      } else if (signal.performance.outcome === 'loss') {
        currentLossStreak++;
        currentWinStreak = 0;
        consecutiveLosses = Math.max(consecutiveLosses, currentLossStreak);
      }
    }

    return {
      totalTrades: completedSignals.length,
      winRate,
      avgReturn,
      sharpeRatio,
      maxDrawdown,
      consecutiveWins,
      consecutiveLosses,
    };
  }

  private async getEnhancedMarketData(privateKey: string | undefined, coin: string): Promise<MarketData> {
    const client = privateKey ? hyperliquidService.getOrCreateClient(privateKey) : hyperliquidService.createClient();
    const marketData = await hyperliquidService.getEnhancedMarketData(client, coin);

    return {
      symbol: coin,
      price: marketData.price,
      volume24h: marketData.volume24h,
      priceChange24h: marketData.change24h,
      high24h: 0, 
      low24h: 0,  
      volatility: marketData.avgVolatility,
      marketCap: marketData.price * 1000000,
      rsi: marketData.rsi,
      winRate: marketData.winRate,
      sharpeRatio: marketData.sharpeRatio,
      maxDrawdown: marketData.maxDrawdown,
      avgVolatility: marketData.avgVolatility,
    };
  }

  private async recognizePatterns(privateKey: string | undefined, symbol: string): Promise<PatternRecognition> {
    const client = privateKey ? hyperliquidService.getOrCreateClient(privateKey) : hyperliquidService.createClient();
    const coin = hyperliquidService.getApiCoin(symbol);
    const patterns: PatternRecognition['patterns'] = [];
    const timeframes = ["1h", "4h"];
    
    for (const timeframe of timeframes) {
      try {
        const endTime = Date.now();
        const startTime = endTime - (7 * 24 * 60 * 60 * 1000);
        const candles = await client.info.getCandleSnapshot(coin, timeframe, startTime, endTime);
        if (candles && candles.length > 50) {
          const timeframePatterns = hyperliquidService.identifyRealPatterns(candles, symbol);
          patterns.push(...timeframePatterns.map(p => ({ ...p, timeframe })));
        }
      } catch (error) {
        logger.warn(`Error getting ${timeframe} data for ${symbol} pattern recognition`, { error });
      }
    }
    
    const bearishCount = patterns.filter(p => p.signal === "bearish").length;
    const bullishCount = patterns.filter(p => p.signal === "bullish").length;
    const neutralCount = patterns.filter(p => p.signal === "neutral").length;
    
    let overallSignal: PatternRecognition['overallSignal'] = "neutral";
    const avgBearishConfidence = bearishCount > 0 ? patterns.filter(p => p.signal === "bearish").reduce((sum, p) => sum + p.confidence, 0) / bearishCount : 0;
    const avgBullishConfidence = bullishCount > 0 ? patterns.filter(p => p.signal === "bullish").reduce((sum, p) => sum + p.confidence, 0) / bullishCount : 0;
    
    if (bearishCount >= 2 && avgBearishConfidence > 70) overallSignal = "strong_bearish";
    else if (bearishCount >= 1 && avgBearishConfidence > 60) overallSignal = "bearish";
    else if (bullishCount >= 2 && avgBullishConfidence > 70) overallSignal = "strong_bullish";
    else if (bullishCount >= 1 && avgBullishConfidence > 60) overallSignal = "bullish";
    
    return {
      patterns,
      overallSignal,
      patternCount: { bearish: bearishCount, bullish: bullishCount, neutral: neutralCount },
    };
  }

  private calculateAdvancedOpportunityScore(data: MarketData, fearGreedIndex: number): number {
    let score = 0;
    
    // Win Rate (40% weight)
    const winRateScore = Math.min(data.winRate, 100);
    score += winRateScore * 0.4;
    
    // Sharpe Ratio (20% weight)
    const sharpeScore = Math.max(0, Math.min(100, (data.sharpeRatio + 2) * 25));
    score += sharpeScore * 0.2;
    
    // Technical Momentum (20% weight)
    let momentumScore = 50;
    if (data.rsi > 70) momentumScore += 15;
    else if (data.rsi < 30) momentumScore += 20;
    else if (data.rsi > 45 && data.rsi < 55) momentumScore -= 10;
    
    if (Math.abs(data.priceChange24h) > 5) momentumScore += 15;
    score += Math.min(100, momentumScore) * 0.2;
    
    // Volume & Liquidity (10% weight)
    const volumeScore = Math.min(100, (data.volume24h / 1000000) * 10);
    score += volumeScore * 0.1;
    
    // Sentiment Divergence (10% weight)
    let sentimentScore = 0;
    if (fearGreedIndex > 75 && data.rsi > 65) sentimentScore = 80; // Contrarian short
    else if (fearGreedIndex < 25 && data.rsi < 35) sentimentScore = 70; // Contrarian long
    else if (Math.abs(fearGreedIndex - 50) > 20) sentimentScore = 30;
    score += sentimentScore * 0.1;
    
    // Risk penalty for high max drawdown
    if (data.maxDrawdown > 50) score *= 0.8;
    
    return Math.max(0, Math.min(100, score));
  }

  private analyzeSetup(rsi: number, change24h: number, fearGreedIndex: number, winRate: number) {
    if (winRate > 70 && rsi > 70 && fearGreedIndex > 60) {
      return {
        type: "High Win Rate Bearish Reversal",
        direction: "SHORT",
        reasoning: `${winRate.toFixed(1)}% win rate with overbought conditions and greed - premium contrarian setup`,
        confidence: 85,
      };
    } else if (winRate > 65 && rsi < 30 && fearGreedIndex < 40) {
      return {
        type: "High Win Rate Bullish Reversal", 
        direction: "LONG",
        reasoning: `${winRate.toFixed(1)}% win rate with oversold conditions and fear - strong reversal signal`,
        confidence: 80,
      };
    } else if (winRate > 60 && Math.abs(change24h) > 6) {
      return {
        type: "High Win Rate Momentum",
        direction: change24h > 0 ? "LONG" : "SHORT",
        reasoning: `${winRate.toFixed(1)}% win rate with strong momentum - trend continuation likely`,
        confidence: 75,
      };
    } else if (winRate > 55) {
      return {
        type: "Consistent Performer",
        direction: rsi > 50 ? "LONG" : "SHORT",
        reasoning: `${winRate.toFixed(1)}% win rate - reliable performer with decent setup`,
        confidence: 65,
      };
    } else {
      return {
        type: "Low Probability Setup",
        direction: "NEUTRAL",
        reasoning: `${winRate.toFixed(1)}% win rate - wait for better opportunity`,
        confidence: 40,
      };
    }
  }

  private generateAdvancedSignals(data: MarketData, fearGreedIndex: number): string[] {
    const signals = [];
    
    if (data.winRate > 70) signals.push(`🏆 High Win Rate: ${data.winRate.toFixed(1)}%`);
    if (data.sharpeRatio > 1) signals.push(`📈 Strong Sharpe: ${data.sharpeRatio.toFixed(2)}`);
    if (data.rsi < 30) signals.push("🔴 RSI Oversold");
    if (data.rsi > 70) signals.push("🔴 RSI Overbought");
    if (Math.abs(data.priceChange24h) > 8) signals.push("⚡ High Volatility");
    if (data.priceChange24h > 5) signals.push("🟢 Strong Bullish Move");
    if (data.priceChange24h < -5) signals.push("🔴 Strong Bearish Move");
    if (fearGreedIndex > 75) signals.push("😰 Extreme Greed");
    if (fearGreedIndex < 25) signals.push("😨 Extreme Fear");
    if (data.maxDrawdown < 10) signals.push("🛡️ Low Risk Profile");
    if (data.winRate > 60 && fearGreedIndex > 65) signals.push("⚠ Premium Contrarian Setup");
    
    return signals;
  }

  private buildAdvancedAnalysisPrompt(
    symbol: string,
    marketData: MarketData,
    accountBalance: number,
    fearGreedIndex: number,
    patterns: PatternRecognition,
    historicalPerformance?: HistoricalPerformance
  ): string {
    const performanceContext = historicalPerformance 
      ? `Historical Performance: ${historicalPerformance.totalTrades} trades, ${historicalPerformance.winRate.toFixed(1)}% win rate, Sharpe: ${historicalPerformance.sharpeRatio.toFixed(2)}`
      : 'No historical data - use conservative approach';

    return `You are NOSA - an elite cryptocurrency trading analyst specializing in HIGH WIN RATE opportunities. Generate a GENERIC trading signal for ${symbol} that can be used by multiple traders.

IMPORTANT: Generate a GENERIC signal with proper entry/exit levels. DO NOT calculate position sizes - that will be done later when someone executes the trade with their specific account data.

CORE MISSION: Find trades with highest probability of success using win rate as the PRIMARY FACTOR.

WIN RATE METHODOLOGY:
🏆 TIER 1 (>70% Win Rate): Premium setups - highest allocation
📈 TIER 2 (60-70% Win Rate): Strong opportunities - moderate allocation  
⚠️ TIER 3 (50-60% Win Rate): Cautious approach - small allocation
🚫 AVOID (<50% Win Rate): Skip entirely

CURRENT MARKET DATA for ${symbol}:
- Price: $${marketData.price}
- Win Rate: ${marketData.winRate.toFixed(1)}% (${marketData.winRate > 70 ? 'TIER 1 - PREMIUM' : marketData.winRate > 60 ? 'TIER 2 - STRONG' : marketData.winRate > 50 ? 'TIER 3 - CAUTIOUS' : 'AVOID'})
- 24h Volume: $${marketData.volume24h.toLocaleString()}
- 24h Change: ${marketData.priceChange24h.toFixed(2)}%
- RSI: ${marketData.rsi.toFixed(1)} (${marketData.rsi > 70 ? 'Overbought' : marketData.rsi < 30 ? 'Oversold' : 'Neutral'})
- Sharpe Ratio: ${marketData.sharpeRatio.toFixed(2)}
- Max Drawdown: ${marketData.maxDrawdown.toFixed(1)}%
- Volatility: ${marketData.avgVolatility.toFixed(2)}%

ADVANCED PATTERN ANALYSIS:
- Overall Signal: ${patterns.overallSignal.toUpperCase()}
- Bearish Patterns: ${patterns.patternCount.bearish}
- Bullish Patterns: ${patterns.patternCount.bullish}
- Key Patterns Detected: ${patterns.patterns.map(p => `${p.pattern} (${p.confidence}% confidence)`).join(', ') || 'None detected'}

SENTIMENT CONTEXT:
- Fear & Greed Index: ${fearGreedIndex}/100 (${fearGreedIndex > 75 ? 'Extreme Greed - Contrarian Opportunity' : fearGreedIndex < 25 ? 'Extreme Fear - Contrarian Opportunity' : 'Neutral Sentiment'})

REFERENCE CONTEXT (for AI understanding only):
- Reference Balance: $${accountBalance.toLocaleString()}
- ${performanceContext}

CRITICAL SIGNAL REQUIREMENTS:
1. Win rate is PRIMARY factor (40% weight in all decisions)
2. Conservative leverage: 2-5x maximum (NEVER exceed)
3. Proper stop-loss: 2-4% from entry (risk management is key)
4. Risk/reward ratio: minimum 1:2 (reward must exceed risk)
5. Premium contrarian setups: High win rate + extreme sentiment = best opportunities

SIGNAL GENERATION LOGIC:
Based on your proven methodology:
- If win rate > 70% + confirmed patterns + extreme sentiment = PREMIUM SETUP (highest confidence)
- If win rate > 65% + good patterns = STRONG SETUP (high confidence)
- If win rate > 55% + mixed signals = CAUTIOUS SETUP (moderate confidence)  
- If win rate < 50% = AVOID (insufficient probability)

RESPONSE REQUIREMENTS:
Provide comprehensive GENERIC signal in JSON format:

{
  "signal": {
    "side": "long" | "short",
    "entryPrice": number (precise entry level based on current market),
    "stopLoss": number (2-4% risk management from entry),
    "takeProfit": number (minimum 1:2 risk/reward from entry),
    "leverage": number (2-5x maximum, conservative),
    "riskRewardRatio": number (minimum 2.0),
    "confidence": number (0-100, based on win rate + patterns + sentiment),
    "analysis": {
      "technicalAnalysis": "Detailed analysis focusing on win rate, RSI, key support/resistance levels, and pattern confirmations",
      "marketAnalysis": "Volume profile, institutional activity, sector strength, and macro trend assessment",
      "sentimentAnalysis": "Fear/greed impact, contrarian opportunities, crowd psychology, and market positioning",
      "riskAssessment": "Maximum drawdown expectations, stop placement rationale, and risk mitigation strategies"
    },
    "aiInsights": {
      "keyLevels": [array of critical support and resistance levels],
      "patternRecognition": "Primary patterns identified with confidence levels and breakout/breakdown targets",
      "volumeProfile": "Volume analysis, accumulation/distribution patterns, and validation signals",
      "momentumIndicators": "RSI momentum, trend strength, divergences, and momentum sustainability"
    }
  },
  "reasoning": "Concise 2-3 sentence explanation focusing on win rate tier + technical confluence + sentiment edge + risk management rationale"
}

REMEMBER: This is a GENERIC signal for multiple users. Focus on precise entry/exit levels and conservative risk management. Position sizing will be calculated later based on individual account sizes.`;
  }

  private applySignalRiskManagement(signal: TradingSignal, marketData: MarketData): TradingSignal {

    const maxLeverage = Math.min(signal.leverage, 5);
    const conservativeLeverage = Math.max(2, Math.min(maxLeverage, signal.confidence > 80 ? 5 : 3));
    
    let adjustedConfidence = signal.confidence;
    if (marketData.winRate > 70) adjustedConfidence = Math.min(95, signal.confidence + 10); // Tier 1 boost
    else if (marketData.winRate < 50) adjustedConfidence = Math.max(30, signal.confidence - 20); // Penalty for low win rate
    
    return {
      ...signal,
      leverage: conservativeLeverage,
      confidence: adjustedConfidence,
      riskRewardRatio: Math.max(2, signal.riskRewardRatio), // Minimum 1:2 R/R
    };
  }

  private async getFearGreedIndex(): Promise<number> {
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json() as { data: Array<{ value: string }> };
      return parseInt(data.data[0].value);
    } catch (error) {
      logger.warn('Failed to fetch fear & greed index, using default 50', { error });
      return 50;
    }
  }

  private preciseRoundToLotSize(size: number, lotSize: number): number {
    if (lotSize <= 0) return Math.round(size * 10000) / 10000;
    
    // Calculate decimal places from lot size
    const decimals = Math.max(0, Math.ceil(-Math.log10(lotSize)));
    const factor = Math.pow(10, decimals);
    
    const roundedSize = Math.round(size / lotSize) * lotSize;
    return Math.round(roundedSize * factor) / factor;
  }

  private preciseCalculation(value: number): number {
    // Round to 8 decimal places to avoid floating point errors
    return Math.round(value * 100000000) / 100000000;
  }

  private validatePositionSafety(
    positionSize: number,
    entryPrice: number,
    stopLoss: number,
    leverage: number,
    availableMargin: number
  ): { isValid: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let isValid = true;

    // Check position size sanity
    if (positionSize > availableMargin * leverage * 0.95) {
      reasons.push('Position size would use >95% of available margin');
      isValid = false;
    }

    // Check leverage sanity
    if (leverage > 10 && Math.abs(entryPrice - stopLoss) / entryPrice < 0.02) {
      reasons.push('High leverage with tight stop loss - extreme risk');
      isValid = false;
    }

    // Check stop loss placement
    const stopDistancePercent = Math.abs(entryPrice - stopLoss) / entryPrice * 100;
    if (stopDistancePercent > 15) {
      reasons.push(`Stop loss too far: ${stopDistancePercent.toFixed(1)}% - reconsider trade`);
      isValid = false;
    }

    // Check minimum position value (avoid dust trades)
    const positionValue = positionSize * entryPrice;
    if (positionValue < 5) {
      reasons.push('Position value too small - not worth trading fees');
      isValid = false;
    }

    return { isValid, reasons };
  }

  private calculateSignalQuality(
    signal: TradingSignal,
    marketData: MarketData,
    patterns: PatternRecognition
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const winRateScore = Math.min(40, (marketData.winRate / 100) * 40);
    score += winRateScore;
    
    if (marketData.winRate > 70) {
      reasons.push(`Excellent win rate: ${marketData.winRate.toFixed(1)}%`);
    } else if (marketData.winRate > 60) {
      reasons.push(`Good win rate: ${marketData.winRate.toFixed(1)}%`);
    } else if (marketData.winRate < 50) {
      reasons.push(`Poor win rate: ${marketData.winRate.toFixed(1)}%`);
    }

    // Risk/Reward Ratio (20 points max)
    const rrScore = Math.min(20, (signal.riskRewardRatio - 1) * 10); // 2:1 = 10pts, 3:1 = 20pts
    score += rrScore;
    
    if (signal.riskRewardRatio >= 3) {
      reasons.push(`Excellent R/R: 1:${signal.riskRewardRatio.toFixed(1)}`);
    } else if (signal.riskRewardRatio >= 2) {
      reasons.push(`Good R/R: 1:${signal.riskRewardRatio.toFixed(1)}`);
    } else {
      reasons.push(`Poor R/R: 1:${signal.riskRewardRatio.toFixed(1)}`);
    }

    // Technical Confluence (15 points max)
    let technicalScore = 0;
    const strongPatterns = patterns.patterns.filter(p => p.confidence > 70).length;
    const moderatePatterns = patterns.patterns.filter(p => p.confidence > 50).length;
    
    if (strongPatterns >= 2) {
      technicalScore = 15;
      reasons.push(`Strong pattern confluence: ${strongPatterns} high-confidence patterns`);
    } else if (strongPatterns >= 1 || moderatePatterns >= 2) {
      technicalScore = 10;
      reasons.push(`Moderate pattern support`);
    } else {
      technicalScore = 0;
      reasons.push(`Weak pattern support`);
    }
    score += technicalScore;

    // Market Conditions (10 points max)
    let marketScore = 0;
    
    // Volume check
    if (marketData.volume24h > 1000000) {
      marketScore += 3;
      reasons.push(`Good liquidity: $${(marketData.volume24h/1000000).toFixed(1)}M volume`);
    }
    
    // Volatility check
    if (marketData.avgVolatility > 5 && marketData.avgVolatility < 30) {
      marketScore += 3;
      reasons.push(`Healthy volatility: ${marketData.avgVolatility.toFixed(1)}%`);
    } else if (marketData.avgVolatility > 50) {
      reasons.push(`High volatility warning: ${marketData.avgVolatility.toFixed(1)}%`);
    }
    
    // RSI positioning
    if ((marketData.rsi < 35 && signal.side === 'long') || (marketData.rsi > 65 && signal.side === 'short')) {
      marketScore += 4;
      reasons.push(`Good RSI positioning: ${marketData.rsi.toFixed(1)}`);
    }
    
    score += marketScore;

    // Confidence & Risk Assessment (10 points max)
    let riskScore = 0;
    
    if (signal.confidence > 80) {
      riskScore += 5;
      reasons.push(`High AI confidence: ${signal.confidence}%`);
    } else if (signal.confidence < 60) {
      reasons.push(`Low AI confidence: ${signal.confidence}%`);
    }
    
    // Conservative leverage bonus
    if (signal.leverage <= 3) {
      riskScore += 3;
      reasons.push(`Conservative leverage: ${signal.leverage}x`);
    } else if (signal.leverage > 5) {
      riskScore -= 2;
      reasons.push(`High leverage risk: ${signal.leverage}x`);
    }
    
    // Max drawdown check
    if (marketData.maxDrawdown < 20) {
      riskScore += 2;
      reasons.push(`Low historical drawdown: ${marketData.maxDrawdown.toFixed(1)}%`);
    }
    
    score += Math.max(0, riskScore);

    // Quality penalties
    if (marketData.sharpeRatio < 0) {
      score -= 10;
      reasons.push(`Negative Sharpe ratio: ${marketData.sharpeRatio.toFixed(2)}`);
    }
    
    if (marketData.volume24h < 100000) {
      score -= 15;
      reasons.push(`Low volume warning: $${marketData.volume24h.toLocaleString()}`);
    }

    const finalScore = Math.max(0, Math.min(100, score));
    
    return {
      score: Math.round(finalScore),
      reasons: reasons.slice(0, 5) // Keep top 5 most important reasons
    };
  }

}

export const tradingService = new TradingService();