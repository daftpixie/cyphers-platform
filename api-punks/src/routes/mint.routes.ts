// src/routes/mint.routes.ts
// Minting flow routes

import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import {
  startMintSession,
  getSessionStatus,
  processPaymentConfirmation,
  cancelSession,
  getMintStats,
} from '../services/mint.service.js';

const router = Router();

// Validation schemas
const confirmPaymentSchema = z.object({
  txHash: z.string().min(10, 'Invalid transaction hash'),
});

/**
 * POST /mint/request
 * Start a new minting session
 */
router.post(
  '/request',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError('User not authenticated');
    }
    
    const session = await startMintSession({
      userId: req.user.id,
      dogeAddress: req.user.dogeAddress,
    });
    
    res.json({
      success: true,
      data: session,
    });
  })
);

/**
 * GET /mint/status/:sessionId
 * Get the status of a minting session
 */
router.get(
  '/status/:sessionId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    
    const status = await getSessionStatus(sessionId);
    
    res.json({
      success: true,
      data: status,
    });
  })
);

/**
 * POST /mint/confirm-payment
 * Submit payment transaction hash for verification
 */
router.post(
  '/confirm-payment',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    const { txHash } = confirmPaymentSchema.parse(req.body);
    
    if (!sessionId) {
      throw new BadRequestError('Session ID is required');
    }
    
    const status = await processPaymentConfirmation(sessionId, txHash);
    
    res.json({
      success: true,
      data: status,
    });
  })
);

/**
 * POST /mint/cancel/:sessionId
 * Cancel an active minting session
 */
router.post(
  '/cancel/:sessionId',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new BadRequestError('User not authenticated');
    }
    
    const { sessionId } = req.params;
    
    await cancelSession(sessionId, req.user.id);
    
    res.json({
      success: true,
      message: 'Session cancelled successfully',
    });
  })
);

/**
 * GET /mint/stats
 * Get minting statistics (public)
 */
router.get(
  '/stats',
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await getMintStats();
    
    res.json({
      success: true,
      data: stats,
    });
  })
);

/**
 * GET /mint/price
 * Get current mint price
 */
router.get('/price', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      price: 100, // DOGE
      currency: 'DOGE',
      maxSupply: 1000,
    },
  });
});

export default router;
