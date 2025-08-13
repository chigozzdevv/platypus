import { Request, Response } from 'express';
import { campService } from './camp.service';
import { authService } from '../auth/auth.service';
import { signalsService } from '../signals/signals.service';
import { IPAsset } from './ip.model';
import { sendSuccess, sendError } from '@/shared/utils/responses';
import { logger } from '@/shared/utils/logger';
import { AuthenticatedRequest } from '@/shared/types/api.types';
import { asyncHandler } from '@/shared/middleware/error.middleware';
import { CustomError } from '@/shared/middleware/error.middleware';

export class IPController {
  registerSignalAsIP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { signalId, improvementIndex } = req.body;

    if (!signalId) {
      throw new CustomError('SIGNAL_ID_REQUIRED', 400, 'Signal ID is required');
    }

    // Get the signal data
    const signal = await signalsService.getSignalById(signalId);
    if (!signal) {
      throw new CustomError('SIGNAL_NOT_FOUND', 404, 'Signal not found');
    }

    // Get user credentials for wallet operations
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Wallet credentials required for IP registration');
    }

    let improvementData = null;
    if (improvementIndex !== undefined && signal.improvements && signal.improvements[improvementIndex]) {
      improvementData = signal.improvements[improvementIndex];
      
      // Verify the improvement belongs to the requesting user
      if (improvementData.user.toString() !== authReq.user.id) {
        throw new CustomError('UNAUTHORIZED', 403, 'You can only register your own improvements as IP');
      }
    } else if (signal.creator.toString() !== authReq.user.id) {
      // If registering base signal, must be the creator
      throw new CustomError('UNAUTHORIZED', 403, 'You can only register signals you created as IP');
    }

    try {
      const registration = await campService.registerSignalAsIP(
        signal,
        improvementData,
        credentials.privateKey,
        credentials.walletAddress
      );

      // Update the signal/improvement to mark it as registered
      if (improvementIndex !== undefined && signal.improvements && signal.improvements[improvementIndex]) {
        signal.improvements[improvementIndex].registeredAsIP = true;
        signal.improvements[improvementIndex].ipTokenId = registration.tokenId;
      } else {
        signal.registeredAsIP = true;
        signal.ipTokenId = registration.tokenId;
      }
      
      await signal.save();

      sendSuccess(res, {
        tokenId: registration.tokenId,
        transactionHash: registration.transactionHash,
        ipHash: registration.ipHash,
        message: 'Signal successfully registered as IP NFT'
      }, 201);

      logger.info('Signal registered as IP NFT', {
        userId: authReq.user.id,
        signalId,
        tokenId: registration.tokenId,
        improvementIndex
      });
    } catch (error) {
      logger.error('Failed to register signal as IP', { error, userId: authReq.user.id, signalId });
      throw error;
    }
  });

  purchaseAccess = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { tokenId, periods = 1 } = req.body;

    if (!tokenId) {
      throw new CustomError('TOKEN_ID_REQUIRED', 400, 'Token ID is required');
    }

    // Get user credentials for transaction
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Wallet credentials required for purchase');
    }

    try {
      const result = await campService.purchaseAccess(
        tokenId,
        credentials.privateKey,
        credentials.walletAddress,
        periods
      );

      sendSuccess(res, {
        ...result,
        message: 'Access purchased successfully'
      });

      logger.info('IP access purchased', {
        userId: authReq.user.id,
        tokenId,
        periods,
        transactionHash: result.transactionHash
      });
    } catch (error) {
      logger.error('Failed to purchase IP access', { error, userId: authReq.user.id, tokenId });
      throw error;
    }
  });

  getUserAssets = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;

    // Get user wallet address
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Wallet credentials required');
    }

    try {
      const assets = await campService.getUserIPAssets(credentials.walletAddress);
      sendSuccess(res, { assets, total: assets.length });
    } catch (error) {
      logger.error('Failed to get user IP assets', { error, userId: authReq.user.id });
      throw error;
    }
  });

  checkAccess = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const { tokenId } = req.params;

    if (!tokenId) {
      throw new CustomError('TOKEN_ID_REQUIRED', 400, 'Token ID is required');
    }

    // Get user wallet address
    const credentials = await authService.getExchangeCredentials(authReq.user.id, 'hyperliquid');
    if (!credentials) {
      throw new CustomError('CREDENTIALS_REQUIRED', 400, 'Wallet credentials required');
    }

    try {
      const accessInfo = await campService.checkAccess(tokenId, credentials.walletAddress);
      sendSuccess(res, accessInfo);
    } catch (error) {
      logger.error('Failed to check IP access', { error, userId: authReq.user.id, tokenId });
      throw error;
    }
  });

  getAssetData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { tokenId } = req.params;

    if (!tokenId) {
      throw new CustomError('TOKEN_ID_REQUIRED', 400, 'Token ID is required');
    }

    try {
      const data = await campService.getIPAssetData(tokenId);
      sendSuccess(res, data);
    } catch (error) {
      logger.error('Failed to get IP asset data', { error, tokenId });
      throw error;
    }
  });

  getMarketplace = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { type, symbol, limit = 20, offset = 0 } = req.query;

    try {
      // Query our database for marketplace assets
      const query: any = { isActive: true };
      if (type) query.type = type;
      if (symbol) query['metadata.signalData.symbol'] = (symbol as string).toUpperCase();

      const assets = await IPAsset
        .find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('creator', 'username avatar reputation');

      const total = await IPAsset.countDocuments(query);

      // Return preview data (hide sensitive details until purchase)
      const previewAssets = assets.map((asset: any) => ({
        tokenId: asset.originAssetId || asset.assetId,
        name: asset.name,
        description: asset.description.slice(0, 150) + '...',
        type: asset.type,
        price: asset.price,
        currency: asset.currency,
        creator: asset.creator,
        totalSales: asset.totalSales,
        symbol: asset.metadata.signalData.symbol,
        side: asset.metadata.signalData.side,
        confidence: asset.metadata.signalData.confidence,
        createdAt: asset.createdAt,
        previewOnly: true
      }));

      sendSuccess(res, { 
        assets: previewAssets, 
        total,
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (error) {
      logger.error('Failed to get marketplace assets', { error, query: req.query });
      throw new CustomError('MARKETPLACE_ERROR', 500, 'Failed to fetch marketplace assets');
    }
  });
}

export const ipController = new IPController();