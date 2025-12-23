// src/services/doge.service.ts
// Dogecoin wallet authentication and signature verification

import bitcoinMessage from 'bitcoinjs-message';
import { nanoid } from 'nanoid';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { BadRequestError, UnauthorizedError } from '../middleware/errorHandler.js';

// Challenge expiration time (5 minutes)
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;

// Message template for signing
const MESSAGE_TEMPLATE = 'Access The Cyphers. Nonce: {nonce}';

// Dogecoin address validation regex
// Mainnet addresses start with 'D', testnet with 'n'
const DOGE_ADDRESS_REGEX = /^[Dn][1-9A-HJ-NP-Za-km-z]{25,34}$/;

export interface ChallengeResult {
  nonce: string;
  message: string;
  expiresAt: Date;
}

export interface VerifyResult {
  valid: boolean;
  dogeAddress: string;
  userId: string;
}

/**
 * Validate a Dogecoin address format
 */
export function isValidDogeAddress(address: string): boolean {
  return DOGE_ADDRESS_REGEX.test(address);
}

/**
 * Generate a challenge nonce for wallet authentication
 */
export async function generateChallenge(dogeAddress?: string): Promise<ChallengeResult> {
  // Validate address if provided
  if (dogeAddress && !isValidDogeAddress(dogeAddress)) {
    throw new BadRequestError('Invalid Dogecoin address format');
  }
  
  // Generate unique nonce
  const nonce = nanoid(32);
  const expiresAt = new Date(Date.now() + CHALLENGE_EXPIRY_MS);
  const message = MESSAGE_TEMPLATE.replace('{nonce}', nonce);
  
  // Store challenge in database
  await prisma.authChallenge.create({
    data: {
      nonce,
      dogeAddress: dogeAddress || null,
      expiresAt,
      used: false,
    },
  });
  
  logger.debug('Challenge generated', { nonce, dogeAddress, expiresAt });
  
  return {
    nonce,
    message,
    expiresAt,
  };
}

/**
 * Verify a signed message from a Dogecoin wallet
 */
export async function verifySignature(
  nonce: string,
  signature: string,
  dogeAddress: string
): Promise<VerifyResult> {
  // Validate address format
  if (!isValidDogeAddress(dogeAddress)) {
    throw new BadRequestError('Invalid Dogecoin address format');
  }
  
  // Find and validate challenge
  const challenge = await prisma.authChallenge.findUnique({
    where: { nonce },
  });
  
  if (!challenge) {
    throw new UnauthorizedError('Challenge not found', 'CHALLENGE_NOT_FOUND');
  }
  
  if (challenge.used) {
    throw new UnauthorizedError('Challenge already used', 'CHALLENGE_USED');
  }
  
  if (challenge.expiresAt < new Date()) {
    // Clean up expired challenge
    await prisma.authChallenge.delete({ where: { nonce } });
    throw new UnauthorizedError('Challenge expired', 'CHALLENGE_EXPIRED');
  }
  
  // If address was specified in challenge, verify it matches
  if (challenge.dogeAddress && challenge.dogeAddress !== dogeAddress) {
    throw new UnauthorizedError('Address mismatch', 'ADDRESS_MISMATCH');
  }
  
  // Construct the message that was signed
  const message = MESSAGE_TEMPLATE.replace('{nonce}', nonce);
  
  // Verify the signature
  let isValid = false;
  
  // Log for debugging
  logger.info('Verifying signature', { 
    message, 
    dogeAddress, 
    signatureLength: signature.length,
    signaturePreview: signature.substring(0, 20) + '...'
  });
  
  try {
    // Method 1: Standard bitcoinjs-message verification
    // Dogecoin uses the same signing format as Bitcoin
    isValid = bitcoinMessage.verify(
      message,
      dogeAddress,
      signature,
      '\x19Dogecoin Signed Message:\n' // Dogecoin message prefix
    );
    logger.info('Method 1 (Doge prefix) result:', { isValid });
  } catch (error) {
    logger.warn('Method 1 failed', { error: String(error) });
  }
  
  if (!isValid) {
    try {
      // Method 2: Try with Bitcoin prefix (some wallets use this)
      isValid = bitcoinMessage.verify(
        message,
        dogeAddress,
        signature,
        '\x19Bitcoin Signed Message:\n'
      );
      logger.info('Method 2 (Bitcoin prefix) result:', { isValid });
    } catch (error) {
      logger.warn('Method 2 failed', { error: String(error) });
    }
  }
  
  if (!isValid) {
    try {
      // Method 3: Try with base64 decoded signature buffer
      const signatureBuffer = Buffer.from(signature, 'base64');
      isValid = bitcoinMessage.verify(
        message,
        dogeAddress,
        signatureBuffer,
        '\x19Dogecoin Signed Message:\n'
      );
      logger.info('Method 3 (buffer + Doge prefix) result:', { isValid });
    } catch (error) {
      logger.warn('Method 3 failed', { error: String(error) });
    }
  }
  
  if (!isValid) {
    try {
      // Method 4: Try without explicit prefix (library default)
      isValid = bitcoinMessage.verify(
        message,
        dogeAddress,
        signature
      );
      logger.info('Method 4 (no prefix) result:', { isValid });
    } catch (error) {
      logger.warn('Method 4 failed', { error: String(error) });
    }
  }
  
  if (!isValid) {
    try {
      // Method 5: Try with checkSegwitAlways flag
      isValid = bitcoinMessage.verify(
        message,
        dogeAddress,
        signature,
        undefined,
        true
      );
      logger.info('Method 5 (segwit check) result:', { isValid });
    } catch (error) {
      logger.warn('Method 5 failed', { error: String(error) });
    }
  }
  
  if (!isValid) {
    throw new UnauthorizedError('Invalid signature', 'INVALID_SIGNATURE');
  }
  
  // Mark challenge as used
  await prisma.authChallenge.update({
    where: { nonce },
    data: { used: true },
  });
  
  // Find or create user
  let user = await prisma.user.findUnique({
    where: { dogeAddress },
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        dogeAddress,
        loginCount: 1,
        lastLoginAt: new Date(),
      },
    });
    logger.info('New user created', { userId: user.id, dogeAddress });
  } else {
    // Update login stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginCount: { increment: 1 },
        lastLoginAt: new Date(),
      },
    });
  }
  
  logger.info('User authenticated', { userId: user.id, dogeAddress });
  
  return {
    valid: true,
    dogeAddress,
    userId: user.id,
  };
}

/**
 * Clean up expired challenges (call periodically)
 */
export async function cleanupExpiredChallenges(): Promise<number> {
  const result = await prisma.authChallenge.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true, createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
      ],
    },
  });
  
  if (result.count > 0) {
    logger.debug(`Cleaned up ${result.count} expired challenges`);
  }
  
  return result.count;
}

/**
 * Link an Ethereum address to a Doge user (for cross-platform integration)
 */
export async function linkEthAddress(
  userId: string,
  ethAddress: string,
  _signature: string,
  _message: string
): Promise<boolean> {
  // This would verify an Ethereum signature
  // For now, just store the link (full SIWE verification would go here)
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    throw new BadRequestError('User not found');
  }
  
  // Check if Eth address is already linked to another user
  const existingLink = await prisma.user.findUnique({
    where: { ethAddress },
  });
  
  if (existingLink && existingLink.id !== userId) {
    throw new BadRequestError('Ethereum address already linked to another account');
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      ethAddress,
      linkedAt: new Date(),
    },
  });
  
  logger.info('Eth address linked', { userId, ethAddress });
  
  return true;
}
