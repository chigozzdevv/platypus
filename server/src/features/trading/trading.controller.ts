import { Request, Response } from 'express';
import { tradingService } from './trading.service';
import { hyperliquidService } from './hyperliquid/hyperliquid.service';
import { authService } from '../auth/auth.service';
import { sendSuccess} from '@/shared/utils/responses';
import { logger } from '@/shared/utils/logger';
import { AuthenticatedRequest } from '@/shared/types/api.types';
import { asyncHandler } from '@/shared/middleware/error.middleware';
import { CustomError } from '@/shared/middleware/error.middleware';

class TradingController {
  findOpportunities = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Hyperliquid credentials required');
    }

    const opportunities = await tradingService.findTopOpportunities(credentials.privateKey, req.query);
    sendSuccess(res, opportunities);
  });

  executeTrade = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Hyperliquid credentials required');
    }

    const { signal, riskPercentage = 2, maxLeverage = 5, orderType = 'limit' } = req.body;
    
    const result = await tradingService.executePreciseTrade(
      signal,
      credentials.privateKey,
      credentials.walletAddress,
      riskPercentage,
      maxLeverage,
      orderType
    );
    
    sendSuccess(res, { ...result, message: 'Trade executed successfully' }, 200);
    logger.info('Trade execution completed', { userId: authReq.user.id, symbol: signal.symbol, success: result.success });
  });

  getPositions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Hyperliquid credentials required');
    }

    const client = hyperliquidService.getOrCreateClient(credentials.privateKey, credentials.walletAddress);
    const accountInfo = await client.info.perpetuals.getClearinghouseState(credentials.walletAddress);
    sendSuccess(res, accountInfo.assetPositions || []);
  });

  getAccountInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Hyperliquid credentials required');
    }

    const client = hyperliquidService.getOrCreateClient(credentials.privateKey, credentials.walletAddress);
    const accountInfo = await client.info.perpetuals.getClearinghouseState(credentials.walletAddress);
    sendSuccess(res, accountInfo);
  });

   calculatePositionSize = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Hyperliquid credentials required');
    }

    const { signal, riskPercentage = 2, maxLeverage = 5 } = req.body;
    const positionSize = await tradingService.calculatePrecisePositionSize(
      signal,
      credentials.privateKey,
      credentials.walletAddress,
      riskPercentage,
      maxLeverage
    );
    sendSuccess(res, positionSize);
  });
}

export const tradingController = new TradingController();
