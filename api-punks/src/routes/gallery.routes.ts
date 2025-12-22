// src/routes/gallery.routes.ts
// Gallery and portfolio routes for viewing Cyphers

import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { MintStatus } from '@prisma/client';

const router = Router();

// Query validation
const listQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v, 10), 50) : 20)),
  rarity: z.enum(['LEGENDARY', 'EPIC', 'RARE', 'COMMON']).optional(),
  sort: z.enum(['newest', 'oldest', 'tokenId', 'rarity']).optional().default('tokenId'),
});

/**
 * GET /cyphers
 * List all minted Cyphers (public gallery)
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const { page, limit, rarity, sort } = query;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Record<string, unknown> = {
      status: MintStatus.CONFIRMED,
    };
    
    if (rarity) {
      where.rarityTier = rarity;
    }
    
    // Build order by
    let orderBy: Record<string, 'asc' | 'desc'> = { tokenId: 'asc' };
    switch (sort) {
      case 'newest':
        orderBy = { inscribedAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { inscribedAt: 'asc' };
        break;
      case 'rarity':
        orderBy = { rarityTier: 'asc' };
        break;
    }
    
    // Fetch cyphers
    const [cyphers, total] = await Promise.all([
      prisma.cypherNFT.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          tokenId: true,
          rarityTier: true,
          rarityRole: true,
          maskType: true,
          materialType: true,
          accentColor: true,
          imageUrl: true,
          ipfsUrl: true,
          inscriptionId: true,
          ownerAddress: true,
          inscribedAt: true,
          traitMetadata: true,
        },
      }),
      prisma.cypherNFT.count({ where }),
    ]);
    
    // Format response
    const formattedCyphers = cyphers.map((cypher) => ({
      id: cypher.id,
      tokenId: cypher.tokenId,
      name: `Cypher #${cypher.tokenId}`,
      rarityTier: cypher.rarityTier,
      rarityRole: cypher.rarityRole,
      traits: {
        mask: cypher.maskType,
        material: cypher.materialType,
        accent: cypher.accentColor,
      },
      image: cypher.imageUrl || cypher.ipfsUrl,
      inscriptionId: cypher.inscriptionId,
      owner: cypher.ownerAddress,
      mintedAt: cypher.inscribedAt,
      metadata: cypher.traitMetadata,
    }));
    
    res.json({
      success: true,
      data: {
        cyphers: formattedCyphers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + cyphers.length < total,
        },
      },
    });
  })
);

/**
 * GET /cyphers/:id
 * Get a single Cypher by ID or token ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Check if id is a number (token ID) or string (cuid)
    const isTokenId = /^\d+$/.test(id);
    
    const cypher = await prisma.cypherNFT.findFirst({
      where: isTokenId
        ? { tokenId: parseInt(id, 10), status: MintStatus.CONFIRMED }
        : { id, status: MintStatus.CONFIRMED },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            dogeAddress: true,
          },
        },
      },
    });
    
    if (!cypher) {
      throw new NotFoundError('Cypher not found');
    }
    
    res.json({
      success: true,
      data: {
        id: cypher.id,
        tokenId: cypher.tokenId,
        name: (cypher.traitMetadata as Record<string, unknown>)?.name || `Cypher #${cypher.tokenId}`,
        description: (cypher.traitMetadata as Record<string, unknown>)?.description,
        rarityTier: cypher.rarityTier,
        rarityRole: cypher.rarityRole,
        traits: {
          mask: cypher.maskType,
          material: cypher.materialType,
          encryption: cypher.encryptionType,
          glitch: cypher.glitchLevel,
          background: cypher.backgroundStyle,
          accent: cypher.accentColor,
        },
        image: {
          url: cypher.imageUrl,
          ipfs: cypher.ipfsUrl,
          ipfsHash: cypher.ipfsHash,
        },
        inscription: {
          id: cypher.inscriptionId,
          txHash: cypher.inscriptionTx,
          inscribedAt: cypher.inscribedAt,
        },
        owner: {
          address: cypher.ownerAddress,
          displayName: cypher.user?.displayName,
        },
        metadata: cypher.traitMetadata,
        createdAt: cypher.createdAt,
      },
    });
  })
);

/**
 * GET /portfolio/:address
 * Get all Cyphers owned by an address
 */
router.get(
  '/portfolio/:address',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    const query = listQuerySchema.parse(req.query);
    const { page, limit, sort } = query;
    
    const skip = (page - 1) * limit;
    
    // Build order by
    let orderBy: Record<string, 'asc' | 'desc'> = { tokenId: 'asc' };
    switch (sort) {
      case 'newest':
        orderBy = { inscribedAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { inscribedAt: 'asc' };
        break;
      case 'rarity':
        orderBy = { rarityTier: 'asc' };
        break;
    }
    
    const [cyphers, total] = await Promise.all([
      prisma.cypherNFT.findMany({
        where: {
          ownerAddress: address,
          status: MintStatus.CONFIRMED,
        },
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          tokenId: true,
          rarityTier: true,
          rarityRole: true,
          maskType: true,
          materialType: true,
          accentColor: true,
          imageUrl: true,
          ipfsUrl: true,
          inscriptionId: true,
          inscribedAt: true,
          traitMetadata: true,
        },
      }),
      prisma.cypherNFT.count({
        where: {
          ownerAddress: address,
          status: MintStatus.CONFIRMED,
        },
      }),
    ]);
    
    // Get user info if exists
    const user = await prisma.user.findUnique({
      where: { dogeAddress: address },
      select: {
        id: true,
        displayName: true,
        createdAt: true,
      },
    });
    
    // Format response
    const formattedCyphers = cyphers.map((cypher) => ({
      id: cypher.id,
      tokenId: cypher.tokenId,
      name: `Cypher #${cypher.tokenId}`,
      rarityTier: cypher.rarityTier,
      rarityRole: cypher.rarityRole,
      traits: {
        mask: cypher.maskType,
        material: cypher.materialType,
        accent: cypher.accentColor,
      },
      image: cypher.imageUrl || cypher.ipfsUrl,
      inscriptionId: cypher.inscriptionId,
      mintedAt: cypher.inscribedAt,
    }));
    
    res.json({
      success: true,
      data: {
        owner: {
          address,
          displayName: user?.displayName,
          memberSince: user?.createdAt,
        },
        cyphers: formattedCyphers,
        stats: {
          total,
          legendary: cyphers.filter((c) => c.rarityTier === 'LEGENDARY').length,
          epic: cyphers.filter((c) => c.rarityTier === 'EPIC').length,
          rare: cyphers.filter((c) => c.rarityTier === 'RARE').length,
          common: cyphers.filter((c) => c.rarityTier === 'COMMON').length,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + cyphers.length < total,
        },
      },
    });
  })
);

export default router;
