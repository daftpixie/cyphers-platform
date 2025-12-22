// src/routes/auth.routes.ts
// Dogecoin wallet authentication routes

import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { generateChallenge, verifySignature } from '../services/doge.service.js';
import { generateToken } from '../middleware/auth.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Validation schemas
const challengeSchema = z.object({
  dogeAddress: z.string().optional(),
});

const verifySchema = z.object({
  nonce: z.string().min(1, 'Nonce is required'),
  signature: z.string().min(1, 'Signature is required'),
  dogeAddress: z.string().min(1, 'Doge address is required'),
});

/**
 * POST /auth/doge/challenge
 * Generate a challenge nonce for wallet authentication
 */
router.post(
  '/doge/challenge',
  asyncHandler(async (req: Request, res: Response) => {
    const { dogeAddress } = challengeSchema.parse(req.body);
    
    const challenge = await generateChallenge(dogeAddress);
    
    res.json({
      success: true,
      data: {
        nonce: challenge.nonce,
        message: challenge.message,
        expiresAt: challenge.expiresAt.toISOString(),
      },
    });
  })
);

/**
 * POST /auth/doge/verify
 * Verify a signed message and issue JWT
 */
router.post(
  '/doge/verify',
  asyncHandler(async (req: Request, res: Response) => {
    const { nonce, signature, dogeAddress } = verifySchema.parse(req.body);
    
    const result = await verifySignature(nonce, signature, dogeAddress);
    
    // Generate JWT token
    const token = generateToken(result.userId, result.dogeAddress);
    
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: {
        id: true,
        dogeAddress: true,
        displayName: true,
        ethAddress: true,
        linkedAt: true,
        createdAt: true,
        loginCount: true,
        _count: {
          select: { cyphers: true },
        },
      },
    });
    
    logger.info('User logged in', { userId: result.userId, dogeAddress });
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user?.id,
          dogeAddress: user?.dogeAddress,
          displayName: user?.displayName,
          ethLinked: !!user?.ethAddress,
          cyphersOwned: user?._count.cyphers || 0,
          loginCount: user?.loginCount,
          createdAt: user?.createdAt,
        },
      },
    });
  })
);

/**
 * GET /auth/me
 * Get current authenticated user (requires auth)
 */
router.get(
  '/me',
  asyncHandler(async (req: Request, res: Response) => {
    // This route should have auth middleware applied
    // For now, check if Authorization header exists
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new BadRequestError('No authorization header');
    }
    
    // Import auth middleware dynamically to avoid circular deps
    const { requireAuth } = await import('../middleware/auth.js');
    
    // Apply auth and return user
    await new Promise<void>((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    if (!req.user) {
      throw new BadRequestError('User not found');
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        dogeAddress: true,
        displayName: true,
        ethAddress: true,
        linkedAt: true,
        createdAt: true,
        loginCount: true,
        lastLoginAt: true,
        _count: {
          select: { cyphers: true, mintSessions: true },
        },
      },
    });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user?.id,
          dogeAddress: user?.dogeAddress,
          displayName: user?.displayName,
          ethAddress: user?.ethAddress,
          ethLinked: !!user?.ethAddress,
          linkedAt: user?.linkedAt,
          cyphersOwned: user?._count.cyphers || 0,
          totalMintSessions: user?._count.mintSessions || 0,
          loginCount: user?.loginCount,
          lastLoginAt: user?.lastLoginAt,
          createdAt: user?.createdAt,
        },
      },
    });
  })
);

/**
 * POST /auth/logout
 * Logout (client should discard token)
 */
router.post('/logout', (_req: Request, res: Response) => {
  // JWT is stateless, so logout is handled client-side
  res.json({
    success: true,
    message: 'Logged out successfully. Please discard your token.',
  });
});

export default router;
