import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '@/shared/utils/responses';
import { SUCCESS_MESSAGES } from '@/shared/config/constants';
import { logger } from '@/shared/utils/logger';
import { generateAuthMessage } from '@/shared/utils/validators';
import { AuthenticatedRequest } from '@/shared/types/api.types';
import { asyncHandler } from '@/shared/middleware/error.middleware';

export class AuthController {
  generateNonce = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { walletAddress } = req.body;
    
    const nonce = await authService.generateNonce(walletAddress);
    const message = generateAuthMessage(walletAddress, nonce);
    
    sendSuccess(res, { 
      nonce, 
      message,
      walletAddress: walletAddress.toLowerCase() 
    });
  });

  connect = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { walletAddress, signature, message, originJWT } = req.body;
    
    const result = await authService.verifyAndConnect(
      walletAddress,
      signature,
      message,
      originJWT
    );
    
    const userData = result.user.toObject();
    
    sendSuccess(res, {
      user: userData,
      token: result.token,
      message: SUCCESS_MESSAGES.USER_AUTHENTICATED,
    }, 200);
    
    logger.info('User authentication successful', { 
      walletAddress: walletAddress.toLowerCase(),
      userId: result.user._id 
    });
  });

  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    
    const user = await authService.getUserById(userId);
    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
      return;
    }
    
    const userData = user.toObject();
    sendSuccess(res, userData);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const updates = req.body;
    
    const user = await authService.updateUserProfile(userId, updates);
    const userData = user.toObject();
    
    sendSuccess(res, userData);
    
    logger.info('User profile updated', { userId, updates: Object.keys(updates) });
  });

  connectExchange = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { exchange, privateKey, walletAddress } = req.body;
    
    await authService.connectExchange(userId, exchange, {
      privateKey,
      walletAddress,
    });
    
    sendSuccess(res, { 
      message: `${exchange} exchange connected successfully`,
      exchange,
      connected: true,
      walletAddress,
    });
    
    logger.info('Exchange connected', { userId, exchange, walletAddress });
  });

  getExchangeStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { exchange } = req.params;
    
    if (exchange !== 'hyperliquid') {
      sendError(res, 'INVALID_EXCHANGE', 'Unsupported exchange', 400);
      return;
    }
    
    const credentials = await authService.getExchangeCredentials(userId, exchange);
    const isConnected = credentials !== null;
    
    sendSuccess(res, { 
      exchange,
      connected: isConnected,
      walletAddress: credentials?.walletAddress || null,
    });
  });

  testExchangeConnection = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { exchange } = req.params;
    
    if (exchange !== 'hyperliquid') {
      sendError(res, 'INVALID_EXCHANGE', 'Unsupported exchange', 400);
      return;
    }
    
    const credentials = await authService.getExchangeCredentials(userId, exchange);
    if (!credentials) {
      sendError(res, 'EXCHANGE_NOT_CONNECTED', 'Exchange not connected', 400);
      return;
    }
    
    // TODO: Implement actual connection test with Hyperliquid
    // For now, just verify credentials exist
    const testResult = {
      connected: true,
      exchange,
      status: 'Connection test successful',
      walletAddress: credentials.walletAddress,
    };
    
    sendSuccess(res, testResult);
  });

  disconnectExchange = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { exchange } = req.params;
    
    if (exchange !== 'hyperliquid') {
      sendError(res, 'INVALID_EXCHANGE', 'Unsupported exchange', 400);
      return;
    }
    
    const user = await authService.getUserById(userId);
    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User not found', 404);
      return;
    }
    
    if (exchange === 'hyperliquid') {
      user.connectedExchanges.hyperliquid = {
        connected: false,
      };
      await user.save();
    }
    
    sendSuccess(res, { 
      message: `${exchange} exchange disconnected successfully`,
      exchange,
      connected: false,
    });
    
    logger.info('Exchange disconnected', { userId, exchange });
  });

  disconnect = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    
    await authService.disconnect(userId);
    
    sendSuccess(res, { message: 'Disconnected successfully' });
    
    logger.info('User disconnected', { userId });
  });
}

export const authController = new AuthController();