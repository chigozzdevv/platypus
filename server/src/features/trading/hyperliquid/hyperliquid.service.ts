import { Hyperliquid } from 'hyperliquid';
import { logger } from '@/shared/utils/logger';

interface CandleData {
  t: number; T: number; s: string; i: string;
  o: number; c: number; h: number; l: number;
  v: number; n: number;
}

interface TechnicalIndicators {
  rsi: number;
  sma: number;
  ema: number;
  bollinger: { upper: number; middle: number; lower: number };
  macd: { macd: number; signal: number; histogram: number };
}

interface WinningMetrics {
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgVolatility: number;
}

interface PatternResult {
  pattern: string;
  confidence: number;
  signal: "bullish" | "bearish" | "neutral";
  description: string;
  entry?: number;
  target?: number;
  stopLoss?: number;
}

class HyperliquidService {
  private sessions = new Map<string, { client: any; lastUsed: number }>();
  private readonly SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

  getOrCreateClient(privateKey?: string, walletAddress?: string): any {
    if (!privateKey) {
      return new Hyperliquid({ testnet: false, enableWs: false });
    }

    const sessionKey = walletAddress || privateKey.slice(-8);
    const existingSession = this.sessions.get(sessionKey);
    
    if (existingSession && Date.now() - existingSession.lastUsed < this.SESSION_TIMEOUT) {
      existingSession.lastUsed = Date.now();
      return existingSession.client;
    }

    const client = new Hyperliquid({ 
      privateKey, 
      testnet: false, 
      enableWs: false 
    });
    
    this.sessions.set(sessionKey, { client, lastUsed: Date.now() });
    this.cleanupOldSessions();
    
    logger.info('Created new Hyperliquid session', { sessionKey });
    return client;
  }

  createClient(): any {
    return new Hyperliquid({ testnet: false, enableWs: false });
  }

  private cleanupOldSessions(): void {
    const now = Date.now();
    for (const [key, session] of this.sessions.entries()) {
      if (now - session.lastUsed > this.SESSION_TIMEOUT) {
        this.sessions.delete(key);
        logger.debug('Cleaned up old Hyperliquid session', { key });
      }
    }
  }

  getDisplaySymbol(coinName: string): string {
    return coinName.endsWith('-PERP') ? coinName : `${coinName}-PERP`;
  }

  getApiCoin(symbol: string): string {
    return symbol.replace('-PERP', '');
  }

  getPriceFromAllMids(allMids: any, symbol: string): number {
    if (!allMids || typeof allMids !== 'object') {
      console.error('Invalid getAllMids response:', allMids);
      return 0;
    }
    
    const coin = this.getApiCoin(symbol);
    const displaySymbol = this.getDisplaySymbol(symbol);
    
    if (allMids[coin] !== undefined) {
      const price = parseFloat(allMids[coin]);
      if (!isNaN(price) && price > 0) return price;
    }
    
    if (allMids[displaySymbol] !== undefined) {
      const price = parseFloat(allMids[displaySymbol]);
      if (!isNaN(price) && price > 0) return price;
    }
    
    console.error(`No price found for ${symbol}. Coin: ${coin}. Available:`, Object.keys(allMids).slice(0, 10));
    return 0;
  }

  async getAssetSpecs(client: any, symbol: string): Promise<{
    lotSize: number;
    tickSize: number;
    minOrderValue: number;
  }> {
    try {
      const meta = await client.info.perpetuals.getMeta();
      const coin = this.getApiCoin(symbol);
      
      const asset = meta.universe.find((u: any) => u.name === coin);
      if (!asset) {
        console.warn(`Asset specs not found for ${symbol}, using defaults`);
        return { lotSize: 0.0001, tickSize: 0.0001, minOrderValue: 10 };
      }
      
      // Parse lot size from szDecimals (size decimals)
      let lotSize = 0.0001; // default
      if (asset.szDecimals && typeof asset.szDecimals === 'number' && asset.szDecimals > 0) {
        lotSize = 1 / Math.pow(10, asset.szDecimals);
      }
      
      let tickSize = 0.0001; // default
      if (asset.maxLeverage && typeof asset.maxLeverage === 'number') {

        if (asset.maxLeverage >= 50) {
          tickSize = 0.00001; // 5 decimals for high leverage
        } else if (asset.maxLeverage >= 20) {
          tickSize = 0.0001;  // 4 decimals for medium leverage
        } else {
          tickSize = 0.001;   // 3 decimals for low leverage
        }
      }
      
      console.log(`Asset specs for ${symbol}: lotSize=${lotSize}, tickSize=${tickSize}, maxLev=${asset.maxLeverage}`);
      return { 
        lotSize,
        tickSize,
        minOrderValue: 10 
      };
    } catch (error) {
      console.warn(`Failed to get asset specs for ${symbol}:`, error);
      return { lotSize: 0.0001, tickSize: 0.0001, minOrderValue: 10 };
    }
  }

  roundToLotSize(size: number, lotSize: number): number {
    if (lotSize <= 0) return size;
    return Math.round(size / lotSize) * lotSize;
  }

  roundToTickSize(price: number, tickSize: number): number {
    if (tickSize <= 0) return price;
    return Math.round(price / tickSize) * tickSize;
  }

  calculateTechnicalIndicators(candles: CandleData[]): TechnicalIndicators {
    if (candles.length < 20) return {
      rsi: 50,
      sma: candles[candles.length - 1]?.c || 0,
      ema: candles[candles.length - 1]?.c || 0,
      bollinger: { upper: 0, middle: 0, lower: 0 },
      macd: { macd: 0, signal: 0, histogram: 0 }
    };

    const closes = candles.map(c => c.c);
    const period = 14;
    
    // RSI Calculation
    const gains = [];
    const losses = [];
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // SMA
    const sma = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    
    // EMA
    let ema = closes[0];
    const multiplier = 2 / (20 + 1);
    for (let i = 1; i < closes.length; i++) {
      ema = (closes[i] * multiplier) + (ema * (1 - multiplier));
    }

    // Bollinger Bands
    const std = Math.sqrt(closes.slice(-20).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / 20);
    const bollinger = {
      upper: sma + (std * 2),
      middle: sma,
      lower: sma - (std * 2)
    };

    // MACD
    const ema12 = closes.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const ema26 = closes.slice(-26).reduce((a, b) => a + b, 0) / 26;
    const macd = ema12 - ema26;
    const signal = macd;
    const histogram = macd - signal;

    return { rsi, sma, ema, bollinger, macd: { macd, signal, histogram } };
  }

  calculateWinningMetrics(candles: CandleData[]): WinningMetrics {
    if (candles.length < 30) return { winRate: 50, sharpeRatio: 0, maxDrawdown: 0, avgVolatility: 0 };

    const returns = [];
    const volatilities = [];
    
    for (let i = 1; i < candles.length; i++) {
      const ret = (candles[i].c - candles[i - 1].c) / candles[i - 1].c;
      returns.push(ret);
      
      const volatility = Math.abs(candles[i].h - candles[i].l) / candles[i].c;
      volatilities.push(volatility);
    }

    const winningReturns = returns.filter(r => r > 0);
    const winRate = (winningReturns.length / returns.length) * 100;
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdReturn = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = stdReturn === 0 ? 0 : (avgReturn * Math.sqrt(252)) / (stdReturn * Math.sqrt(252));
    
    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = candles[0].c;
    for (const candle of candles) {
      if (candle.c > peak) peak = candle.c;
      const drawdown = (peak - candle.c) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    const avgVolatility = volatilities.reduce((a, b) => a + b, 0) / volatilities.length;

    return { winRate, sharpeRatio, maxDrawdown: maxDrawdown * 100, avgVolatility: avgVolatility * 100 };
  }

  // Advanced Pattern Recognition
  identifyRealPatterns(candles: CandleData[], symbol: string): PatternResult[] {
    if (candles.length < 50) return [];
    
    const patterns: PatternResult[] = [];
    
    const closes = candles.map(c => c.c);
    const highs = candles.map(c => c.h);
    const lows = candles.map(c => c.l);
    const volumes = candles.map(c => c.v);
    
    const currentPrice = closes[closes.length - 1];
    const recentHigh = Math.max(...highs.slice(-20));
    const recentLow = Math.min(...lows.slice(-20));
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    
    // Identify swing points
    const highPoints = [];
    const lowPoints = [];
    for (let i = 10; i < candles.length - 10; i++) {
      const isHigh = highs[i] > highs[i-5] && highs[i] > highs[i+5];
      const isLow = lows[i] < lows[i-5] && lows[i] < lows[i+5];
      if (isHigh) highPoints.push({ index: i, price: highs[i] });
      if (isLow) lowPoints.push({ index: i, price: lows[i] });
    }
    
    // Rising Wedge Pattern
    if (highPoints.length >= 2 && lowPoints.length >= 2) {
      const recentHighs = highPoints.slice(-2);
      const recentLows = lowPoints.slice(-2);
      
      const highSlope = (recentHighs[1].price - recentHighs[0].price) / (recentHighs[1].index - recentHighs[0].index);
      const lowSlope = (recentLows[1].price - recentLows[0].price) / (recentLows[1].index - recentLows[0].index);
      
      if (highSlope > 0 && lowSlope > 0 && lowSlope > highSlope && recentVolume < avgVolume * 0.8) {
        patterns.push({
          pattern: "RISING WEDGE",
          confidence: 78,
          signal: "bearish",
          description: "Rising wedge with volume decline - bearish breakdown expected",
          entry: currentPrice * 0.998,
          target: currentPrice * 0.92,
          stopLoss: currentPrice * 1.025,
        });
      }
    }
    
    // Double Top Pattern
    if (highPoints.length >= 2) {
      const lastTwo = highPoints.slice(-2);
      const priceDiff = Math.abs(lastTwo[1].price - lastTwo[0].price) / lastTwo[0].price;
      if (priceDiff < 0.02 && currentPrice < recentHigh * 0.95) {
        patterns.push({
          pattern: "DOUBLE TOP",
          confidence: 72,
          signal: "bearish",
          description: "Double top formation with rejection - bearish reversal signal",
          entry: currentPrice * 0.997,
          target: currentPrice * 0.90,
          stopLoss: currentPrice * 1.03,
        });
      }
    }
    
    // Bullish Flag Pattern
    const shortMA = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const longMA = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const priceAboveMA = currentPrice > longMA * 1.05;
    const consolidation = (recentHigh - recentLow) / currentPrice < 0.04;
    
    if (priceAboveMA && consolidation && recentVolume > avgVolume) {
      patterns.push({
        pattern: "BULLISH FLAG",
        confidence: 69,
        signal: "bullish",
        description: "Bullish flag consolidation with volume - continuation expected",
        entry: currentPrice * 1.002,
        target: currentPrice * 1.12,
        stopLoss: currentPrice * 0.975,
      });
    }
    
    // Descending Triangle Pattern
    const resistanceLevel = recentHigh;
    const supportTests = lows.slice(-10).filter(low => Math.abs(low - recentLow) / recentLow < 0.01).length;
    
    if (supportTests >= 2 && currentPrice < resistanceLevel * 0.98) {
      patterns.push({
        pattern: "DESCENDING TRIANGLE",
        confidence: 75,
        signal: "bearish",
        description: "Descending triangle with horizontal support - breakdown likely",
        entry: currentPrice * 0.998,
        target: currentPrice * 0.88,
        stopLoss: currentPrice * 1.03,
      });
    }
    
    // Cup and Handle Pattern (Bullish)
    if (candles.length >= 100) {
      const midPoint = Math.floor(candles.length / 2);
      const leftSide = closes.slice(0, midPoint);
      const rightSide = closes.slice(midPoint);
      
      const leftHigh = Math.max(...leftSide);
      const rightHigh = Math.max(...rightSide);
      const cupLow = Math.min(...closes.slice(midPoint - 10, midPoint + 10));
      
      if (Math.abs(leftHigh - rightHigh) / leftHigh < 0.05 && 
          (leftHigh - cupLow) / leftHigh > 0.15 && 
          currentPrice > rightHigh * 0.95) {
        patterns.push({
          pattern: "CUP AND HANDLE",
          confidence: 68,
          signal: "bullish",
          description: "Cup and handle formation - long-term bullish breakout",
          entry: currentPrice * 1.002,
          target: currentPrice * 1.20,
          stopLoss: currentPrice * 0.92,
        });
      }
    }
    
    // Diamond Pattern (Rare but powerful)
    if (highs.length > 50 && lows.length > 50) {
      const recentCandles = candles.slice(-30);
      const recentHighs = recentCandles.map(c => c.h);
      const recentLows = recentCandles.map(c => c.l);
      
      const highVolatility = recentHighs.some((h, i) => i > 0 && Math.abs(h - recentHighs[i-1]) / h > 0.03);
      const convergence = (Math.max(...recentHighs) - Math.min(...recentLows)) / currentPrice < 0.06;
      
      if (highVolatility && convergence && recentVolume < avgVolume * 0.7) {
        patterns.push({
          pattern: "DIAMOND PATTERN",
          confidence: 82,
          signal: "bearish",
          description: "Diamond exhaustion pattern - rare reversal signal",
          entry: currentPrice * 0.995,
          target: currentPrice * 0.85,
          stopLoss: currentPrice * 1.04,
        });
      }
    }
    
    console.log(`Found ${patterns.length} patterns for ${symbol}`);
    return patterns;
  }

  // Enhanced Market Data Analysis
  async getEnhancedMarketData(client: any, coin: string): Promise<{
    price: number;
    change24h: number;
    volume24h: number;
    rsi: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    avgVolatility: number;
  }> {
    try {
      console.log(`Fetching enhanced data for ${coin}...`);
      
      const endTime = Date.now();
      const startTime = endTime - (7 * 24 * 60 * 60 * 1000);
      
      const candles = await client.info.getCandleSnapshot(coin, "1h", startTime, endTime) as CandleData[];
      
      if (!candles || candles.length === 0) {
        console.warn(`No candles for ${coin}`);
        return { price: 0, change24h: 0, volume24h: 0, rsi: 50, winRate: 50, sharpeRatio: 0, maxDrawdown: 0, avgVolatility: 0 };
      }

      const latest = candles[candles.length - 1];
      const dayAgo = candles[candles.length - 24] || candles[0];
      
      const price = latest.c;
      const change24h = ((latest.c - dayAgo.o) / dayAgo.o) * 100;
      const volume24h = candles.slice(-24).reduce((sum, c) => sum + c.v, 0);
      
      const technicals = this.calculateTechnicalIndicators(candles);
      const winMetrics = this.calculateWinningMetrics(candles);
      
      console.log(`${coin}: Price=${price}, Change=${change24h.toFixed(2)}%, WinRate=${winMetrics.winRate.toFixed(1)}%`);
      
      return {
        price,
        change24h,
        volume24h,
        rsi: technicals.rsi,
        ...winMetrics
      };
    } catch (error) {
      console.error(`Error fetching data for ${coin}:`, error);
      return { price: 0, change24h: 0, volume24h: 0, rsi: 50, winRate: 50, sharpeRatio: 0, maxDrawdown: 0, avgVolatility: 0 };
    }
  }

  // Account Risk Profile

  getAccountRiskProfile(accountBalance: number): { usagePct: number; riskPct: number } {
    if (accountBalance < 10) return { usagePct: 85, riskPct: 85 };      // Aggressive for micro accounts
    if (accountBalance < 50) return { usagePct: 50, riskPct: 50 };      // Moderate for small accounts  
    if (accountBalance < 500) return { usagePct: 20, riskPct: 20 };     // Conservative for medium accounts
    return { usagePct: 5, riskPct: 2 };                                 // Very conservative for large accounts
  }

  // Position Size Calculation

  calculatePositionSize(
    accountBalance: number,
    entryPrice: number,
    stopLoss: number,
    riskPercentage: number,
    leverage: number
  ): {
    positionSize: number;
    positionValue: number;
    marginRequired: number;
    riskAmount: number;
  } {
    const riskProfile = this.getAccountRiskProfile(accountBalance);
    const usableMargin = accountBalance * (riskProfile.usagePct / 100);
    
    // Calculate position size based on risk management
    const riskAmount = (accountBalance * riskPercentage) / 100;
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const positionSize = riskAmount / stopDistance;
    const positionValue = positionSize * entryPrice;
    const marginRequired = positionValue / leverage;

    return {
      positionSize: Math.max(positionSize, 0.0001),
      positionValue,
      marginRequired,
      riskAmount,
    };
  }
}

export const hyperliquidService = new HyperliquidService();