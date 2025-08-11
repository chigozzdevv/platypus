import { Request, Response } from 'express';
import { signalsService } from './signals.service';
import { sendSuccess, sendError } from '@/shared/utils/responses';
import { logger } from '@/shared/utils/logger';
import { AuthenticatedRequest } from '@/shared/types/api.types';
import { asyncHandler } from '@/shared/middleware/error.middleware';

export class SignalsController {
  createSignal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { symbol, aiModel, accountBalance } = req.body;
    
    const signal = await signalsService.createAISignal(userId, {
      symbol,
      aiModel: aiModel || 'gpt-4o-mini',
      accountBalance,
    });

    sendSuccess(res, {
      signal: signal.toJSON(),
      message: 'AI trading signal generated successfully',
    }, 201);

    logger.info('Signal created', { 
      userId, 
      signalId: signal._id, 
      symbol,
      confidence: signal.confidence 
    });
  });

  getSignal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { signalId } = req.params;
    
    const signal = await signalsService.getSignalById(signalId);
    if (!signal) {
      sendError(res, 'SIGNAL_NOT_FOUND', 'Signal not found', 404);
      return;
    }

    sendSuccess(res, { signal: signal.toJSON() });
  });

  getUserSignals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    
    const {
      status,
      symbol,
      outcome,
      limit = '20',
      offset = '0'
    } = req.query;

    const result = await signalsService.getUserSignals(userId, {
      status: status as string,
      symbol: symbol as string,
      outcome: outcome as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    sendSuccess(res, {
      signals: result.signals.map(s => s.toJSON()),
      total: result.total,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.total > parseInt(offset as string) + parseInt(limit as string),
      }
    });
  });

  getPublicSignals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      symbol,
      minConfidence,
      sortBy = 'newest',
      limit = '20',
      offset = '0'
    } = req.query;

    const result = await signalsService.getPublicSignals({
      symbol: symbol as string,
      minConfidence: minConfidence ? parseInt(minConfidence as string) : undefined,
      sortBy: sortBy as 'newest' | 'confidence' | 'performance' | 'usage',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    sendSuccess(res, {
      signals: result.signals.map(s => s.toJSON()),
      total: result.total,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.total > parseInt(offset as string) + parseInt(limit as string),
      }
    });
  });

  improveSignal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    const { signalId } = req.params;
    const { improvementType, originalValue, improvedValue, reasoning, newExpiryTime } = req.body;

    const signal = await signalsService.improveSignal(signalId, userId, {
      improvementType,
      originalValue,
      improvedValue,
      reasoning,
      newExpiryTime: newExpiryTime ? new Date(newExpiryTime) : undefined,
    });

    sendSuccess(res, {
      signal: signal.toJSON(),
      message: 'Signal improvement added successfully',
    });

    logger.info('Signal improved', { 
      signalId, 
      userId, 
      improvementType 
    });
  });

  updatePerformance = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { signalId } = req.params;
    const { outcome, actualReturn, executionPrice, exitPrice, exitReason } = req.body;

    const signal = await signalsService.updateSignalPerformance(signalId, {
      outcome,
      actualReturn,
      executionPrice,
      exitPrice,
      exitReason,
    });

    sendSuccess(res, {
      signal: signal.toJSON(),
      message: 'Signal performance updated successfully',
    });

    logger.info('Signal performance updated', { 
      signalId, 
      outcome, 
      actualReturn 
    });
  });

  getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    const stats = await signalsService.getUserPerformanceStats(userId);

    sendSuccess(res, {
      stats,
      message: 'User performance statistics retrieved',
    });
  });

  searchSignals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      q: query,
      symbol,
      minConfidence,
      limit = '20',
      offset = '0'
    } = req.query;

    if (!query || typeof query !== 'string') {
      sendError(res, 'MISSING_QUERY', 'Search query is required', 400);
      return;
    }

    const result = await signalsService.searchSignals(query, {
      symbol: symbol as string,
      minConfidence: minConfidence ? parseInt(minConfidence as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    sendSuccess(res, {
      signals: result.signals.map(s => s.toJSON()),
      total: result.total,
      query,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.total > parseInt(offset as string) + parseInt(limit as string),
      }
    });
  });

  getImprovableSignals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      symbol,
      minConfidence,
      sortBy = 'newest',
      limit = '20',
      offset = '0'
    } = req.query;

    const result = await signalsService.getImprovableSignals({
      symbol: symbol as string,
      minConfidence: minConfidence ? parseInt(minConfidence as string) : undefined,
      sortBy: sortBy as 'newest' | 'confidence' | 'performance',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    sendSuccess(res, {
      signals: result.signals.map(s => s.toJSON()),
      total: result.total,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: result.total > parseInt(offset as string) + parseInt(limit as string),
      }
    });
  });

  expireSignals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await signalsService.expireOldSignals();
    
    sendSuccess(res, {
      message: 'Expired signals processed successfully',
    });
  });
}

export const signalsController = new SignalsController();