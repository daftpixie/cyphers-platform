// src/services/mint.service.ts
// Minting orchestration service - manages the complete mint flow

import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import { prisma, getNextTokenId } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';
import { MintStatus, RarityTier } from '@prisma/client';
import { BadRequestError, NotFoundError, ConflictError } from '../middleware/errorHandler.js';
import { generateCypher } from './claude.service.js';
import { generatePaymentAddress, createInscription, finalizeMint } from './inscribe.service.js';

// Session expiration time (30 minutes)
const SESSION_EXPIRY_MS = 30 * 60 * 1000;

export interface MintRequest {
  userId: string;
  dogeAddress: string;
}

export interface MintSessionResponse {
  sessionId: string;
  status: MintStatus;
  statusMessage: string;
  progress: number;
  paymentAddress?: string;
  paymentAmount?: number;
  cypher?: {
    tokenId: number;
    rarityTier: RarityTier;
    rarityRole: string;
    name?: string;
  };
  expiresAt: Date;
}

/**
 * Start a new minting session
 */
export async function startMintSession(request: MintRequest): Promise<MintSessionResponse> {
  const { userId, dogeAddress } = request;
  
  // Check for existing active sessions
  const existingSession = await prisma.mintSession.findFirst({
    where: {
      userId,
      status: {
        in: [
          MintStatus.PENDING,
          MintStatus.GENERATING,
          MintStatus.AWAITING_PAYMENT,
        ],
      },
      expiresAt: { gt: new Date() },
    },
  });
  
  if (existingSession) {
    throw new ConflictError('You already have an active minting session');
  }
  
  // Check supply
  const tokenId = await getNextTokenId();
  if (tokenId === null) {
    throw new BadRequestError('All Cyphers have been minted - collection sold out!');
  }
  
  // Generate session ID
  const sessionId = nanoid(16);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);
  
  // Create session
  const session = await prisma.mintSession.create({
    data: {
      sessionId,
      userId,
      dogeAddress,
      status: MintStatus.PENDING,
      statusMessage: 'Session started, initializing...',
      progress: 0,
      paymentAmount: config.mint.priceDoge,
      assignedTokenId: tokenId,
      expiresAt,
    },
  });
  
  // Log session start
  await prisma.mintLog.create({
    data: {
      sessionId: session.id,
      level: 'INFO',
      message: `Mint session started for token #${tokenId}`,
      metadata: { tokenId, dogeAddress },
    },
  });
  
  logger.info('Mint session started', { sessionId, userId, tokenId });
  
  // Start generation asynchronously
  processGeneration(sessionId, tokenId, dogeAddress).catch((error) => {
    logger.error('Background generation failed', { sessionId, error });
  });
  
  return {
    sessionId,
    status: MintStatus.PENDING,
    statusMessage: 'Session started, generating your unique Cypher...',
    progress: 5,
    expiresAt,
  };
}

/**
 * Process the AI generation step (runs asynchronously)
 */
async function processGeneration(
  sessionId: string,
  tokenId: number,
  ownerAddress: string
): Promise<void> {
  try {
    // Update status
    await updateSession(sessionId, {
      status: MintStatus.GENERATING,
      statusMessage: 'Generating your unique encrypted identity...',
      progress: 10,
    });
    
    // Generate the Cypher using Claude AI
    const result = await generateCypher(tokenId);
    
    // Create the NFT record
    const cypher = await prisma.cypherNFT.create({
      data: {
        tokenId,
        rarityTier: result.traits.rarityTier,
        rarityRole: result.traits.rarityRole,
        maskType: result.traits.maskType,
        materialType: result.traits.materialType,
        encryptionType: result.traits.encryptionType,
        glitchLevel: result.traits.glitchLevel,
        backgroundStyle: result.traits.backgroundStyle,
        accentColor: result.traits.accentColor,
        traitMetadata: result.metadata as unknown as Prisma.InputJsonValue,
        generationPrompt: result.prompt,
        generationModel: 'claude-sonnet-4-5',
        ownerAddress,
        status: MintStatus.AWAITING_PAYMENT,
      },
    });
    
    // Generate payment address
    const paymentAddress = await generatePaymentAddress(sessionId);
    
    // Update session with generated Cypher
    const session = await prisma.mintSession.findUnique({
      where: { sessionId },
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    await prisma.mintSession.update({
      where: { sessionId },
      data: {
        cypherId: cypher.id,
        status: MintStatus.AWAITING_PAYMENT,
        statusMessage: 'Cypher generated! Awaiting payment...',
        progress: 50,
        paymentAddress,
      },
    });
    
    // Log success
    await prisma.mintLog.create({
      data: {
        sessionId: session.id,
        level: 'INFO',
        message: `Cypher generated: ${result.traits.rarityRole} (${result.traits.rarityTier})`,
        metadata: { 
          tokenId, 
          rarityTier: result.traits.rarityTier,
          rarityRole: result.traits.rarityRole,
        },
      },
    });
    
    logger.info('Generation complete', { 
      sessionId, 
      tokenId, 
      rarityTier: result.traits.rarityTier 
    });
  } catch (error) {
    logger.error('Generation failed', { sessionId, tokenId, error });
    
    await updateSession(sessionId, {
      status: MintStatus.GENERATION_FAILED,
      statusMessage: 'Generation failed. Please try again.',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    
    // Return the token ID to the pool
    // Note: In production, implement proper token ID management
  }
}

/**
 * Get the current status of a minting session
 */
export async function getSessionStatus(sessionId: string): Promise<MintSessionResponse> {
  const session = await prisma.mintSession.findUnique({
    where: { sessionId },
    include: {
      cypher: true,
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  
  if (!session) {
    throw new NotFoundError('Minting session not found');
  }
  
  // Check if expired
  if (session.expiresAt < new Date() && !session.completedAt) {
    await updateSession(sessionId, {
      status: MintStatus.FAILED,
      statusMessage: 'Session expired',
      errorMessage: 'Session timed out',
    });
    
    throw new BadRequestError('Minting session has expired');
  }
  
  const response: MintSessionResponse = {
    sessionId: session.sessionId,
    status: session.status,
    statusMessage: session.statusMessage || '',
    progress: session.progress,
    expiresAt: session.expiresAt,
  };
  
  if (session.paymentAddress) {
    response.paymentAddress = session.paymentAddress;
    response.paymentAmount = session.paymentAmount;
  }
  
  if (session.cypher) {
    response.cypher = {
      tokenId: session.cypher.tokenId,
      rarityTier: session.cypher.rarityTier,
      rarityRole: session.cypher.rarityRole,
      name: (session.cypher.traitMetadata as Record<string, unknown>)?.name as string,
    };
  }
  
  return response;
}

/**
 * Process payment confirmation and continue to inscription
 */
export async function processPaymentConfirmation(
  sessionId: string,
  txHash: string
): Promise<MintSessionResponse> {
  const session = await prisma.mintSession.findUnique({
    where: { sessionId },
    include: { cypher: true },
  });
  
  if (!session) {
    throw new NotFoundError('Minting session not found');
  }
  
  if (session.status !== MintStatus.AWAITING_PAYMENT) {
    throw new BadRequestError(`Invalid session status: ${session.status}`);
  }
  
  if (!session.cypher) {
    throw new BadRequestError('No Cypher associated with this session');
  }
  
  // Update with payment info
  await prisma.mintSession.update({
    where: { sessionId },
    data: {
      paymentTxHash: txHash,
      paymentConfirmedAt: new Date(),
      status: MintStatus.PAYMENT_RECEIVED,
      statusMessage: 'Payment received! Starting inscription...',
      progress: 60,
    },
  });
  
  // Log payment
  await prisma.mintLog.create({
    data: {
      sessionId: session.id,
      level: 'INFO',
      message: `Payment received: ${txHash}`,
      metadata: { txHash },
    },
  });
  
  // Start inscription process asynchronously
  processInscription(sessionId).catch((error) => {
    logger.error('Background inscription failed', { sessionId, error });
  });
  
  return getSessionStatus(sessionId);
}

/**
 * Process the inscription step (runs asynchronously)
 */
async function processInscription(sessionId: string): Promise<void> {
  try {
    const session = await prisma.mintSession.findUnique({
      where: { sessionId },
      include: { cypher: true },
    });
    
    if (!session || !session.cypher) {
      throw new Error('Session or Cypher not found');
    }
    
    // Create inscription
    const result = await createInscription({
      sessionId,
      imageData: '', // Would be actual image data
      contentType: 'image/png',
      metadata: session.cypher.traitMetadata as Record<string, unknown>,
    });
    
    if (result.success && result.inscriptionId && result.txHash) {
      // Finalize the mint
      await finalizeMint(sessionId, result.inscriptionId, result.txHash);
    } else {
      throw new Error(result.error || 'Inscription failed');
    }
  } catch (error) {
    logger.error('Inscription process failed', { sessionId, error });
    
    await updateSession(sessionId, {
      status: MintStatus.INSCRIPTION_FAILED,
      statusMessage: 'Inscription failed. Contact support.',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Helper to update session status
 */
async function updateSession(
  sessionId: string,
  data: Partial<{
    status: MintStatus;
    statusMessage: string;
    progress: number;
    errorMessage: string;
  }>
): Promise<void> {
  await prisma.mintSession.update({
    where: { sessionId },
    data,
  });
}

/**
 * Cancel an active minting session
 */
export async function cancelSession(sessionId: string, userId: string): Promise<void> {
  const session = await prisma.mintSession.findUnique({
    where: { sessionId },
  });
  
  if (!session) {
    throw new NotFoundError('Session not found');
  }
  
  if (session.userId !== userId) {
    throw new BadRequestError('Not authorized to cancel this session');
  }
  
  if (session.status === MintStatus.CONFIRMED) {
    throw new BadRequestError('Cannot cancel a completed mint');
  }
  
  if (session.paymentTxHash) {
    throw new BadRequestError('Cannot cancel after payment - contact support');
  }
  
  await prisma.mintSession.update({
    where: { sessionId },
    data: {
      status: MintStatus.FAILED,
      statusMessage: 'Cancelled by user',
    },
  });
  
  // Return token ID to pool if assigned
  // Note: Implement proper token management in production
  
  logger.info('Session cancelled', { sessionId, userId });
}

/**
 * Get minting statistics
 */
export async function getMintStats(): Promise<{
  totalMinted: number;
  remaining: number;
  rarityBreakdown: Record<string, number>;
}> {
  const counter = await prisma.tokenCounter.findFirst();
  const totalMinted = counter?.lastTokenId || 0;
  const maxSupply = counter?.maxSupply || config.mint.maxSupply;
  
  const breakdown = await prisma.cypherNFT.groupBy({
    by: ['rarityTier'],
    where: { status: MintStatus.CONFIRMED },
    _count: true,
  });
  
  const rarityBreakdown: Record<string, number> = {
    LEGENDARY: 0,
    EPIC: 0,
    RARE: 0,
    COMMON: 0,
  };
  
  breakdown.forEach((item) => {
    rarityBreakdown[item.rarityTier] = item._count;
  });
  
  return {
    totalMinted,
    remaining: maxSupply - totalMinted,
    rarityBreakdown,
  };
}
