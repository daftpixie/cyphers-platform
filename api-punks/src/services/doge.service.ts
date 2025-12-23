// src/services/doge.service.ts
// Dogecoin wallet authentication and signature verification
// Based on bitcoinjs-message library with Dogecoin-specific configuration

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

// Dogecoin message prefix - CRITICAL: Must match exactly what wallet uses
// The \x19 is the length byte (25 = 0x19) for "Dogecoin Signed Message:\n"
const DOGECOIN_MESSAGE_PREFIX = '\x19Dogecoin Signed Message:\n';

// Enable demo mode for development/testing
const DEMO_MODE = process.env.DEMO_MODE === 'true';

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
 * Validate signature format before attempting verification
 * Returns decoded buffer if valid, null if invalid
 */
function validateSignatureFormat(signatureBase64: string): Buffer | null {
  try {
    // Must be a non-empty string
    if (!signatureBase64 || typeof signatureBase64 !== 'string') {
      logger.debug('Signature is empty or not a string');
      return null;
    }

    // Decode from base64
    const sigBuffer = Buffer.from(signatureBase64, 'base64');
    
    // Must be exactly 65 bytes
    if (sigBuffer.length !== 65) {
      logger.debug('Invalid signature length', { 
        expected: 65, 
        actual: sigBuffer.length,
        base64Length: signatureBase64.length 
      });
      return null;
    }
    
    // Header byte must be in valid range (27-42)
    const header = sigBuffer[0];
    if (header < 27 || header > 42) {
      logger.debug('Invalid signature header byte', { 
        header, 
        validRange: '27-42' 
      });
      return null;
    }
    
    return sigBuffer;
  } catch (error) {
    logger.debug('Signature validation error', { error: String(error) });
    return null;
  }
}

/**
 * Verify Dogecoin signature using bitcoinjs-message library
 * This is the primary verification method
 */
function verifyWithBitcoinMessage(
  message: string, 
  address: string, 
  signature: string | Buffer,
  prefix: string
): boolean {
  try {
    return bitcoinMessage.verify(message, address, signature, prefix);
  } catch (error) {
    logger.debug('bitcoinjs-message verify error', { error: String(error) });
    return false;
  }
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
    await prisma.authChallenge.delete({ where: { nonce } }).catch(() => {});
    throw new UnauthorizedError('Challenge expired', 'CHALLENGE_EXPIRED');
  }
  
  // If address was specified in challenge, verify it matches
  if (challenge.dogeAddress && challenge.dogeAddress !== dogeAddress) {
    throw new UnauthorizedError('Address mismatch', 'ADDRESS_MISMATCH');
  }
  
  // Construct the message that was signed
  const message = MESSAGE_TEMPLATE.replace('{nonce}', nonce);
  
  // Log verification attempt
  logger.info('Attempting signature verification', { 
    message, 
    dogeAddress, 
    signatureLength: signature.length,
    signaturePreview: signature.substring(0, 20) + '...',
    demoMode: DEMO_MODE,
  });
  
  let isValid = false;
  let successMethod = '';
  
  // In demo mode, skip signature verification
  if (DEMO_MODE) {
    logger.warn('DEMO MODE ENABLED - Skipping signature verification');
    isValid = true;
    successMethod = 'DEMO_MODE';
  } else {
    // Pre-validate signature format
    const sigBuffer = validateSignatureFormat(signature);
    
    if (!sigBuffer) {
      logger.warn('Signature format validation failed', { dogeAddress });
      throw new UnauthorizedError('Invalid signature format', 'INVALID_SIGNATURE_FORMAT');
    }
    
    // Log signature details for debugging
    const header = sigBuffer[0];
    const flagByte = header - 27;
    const recovery = flagByte & 3;
    const compressed = !!(flagByte & 4);
    
    logger.info('Signature details', {
      header,
      recovery,
      compressed,
      sigBufferLength: sigBuffer.length,
    });
    
    // Try verification methods in order of likelihood
    const verificationAttempts = [
      // Method 1: Base64 string with Dogecoin prefix (most common)
      {
        name: 'dogecoin_prefix_string',
        fn: () => verifyWithBitcoinMessage(message, dogeAddress, signature, DOGECOIN_MESSAGE_PREFIX)
      },
      // Method 2: Buffer with Dogecoin prefix
      {
        name: 'dogecoin_prefix_buffer',
        fn: () => verifyWithBitcoinMessage(message, dogeAddress, sigBuffer, DOGECOIN_MESSAGE_PREFIX)
      },
      // Method 3: With checkSegwitAlways flag
      {
        name: 'dogecoin_segwit_check',
        fn: () => {
          try {
            return bitcoinMessage.verify(message, dogeAddress, signature, DOGECOIN_MESSAGE_PREFIX, true);
          } catch { return false; }
        }
      },
      // Method 4: Default Bitcoin prefix (fallback - some wallets use this)
      {
        name: 'bitcoin_default',
        fn: () => verifyWithBitcoinMessage(message, dogeAddress, signature, '\x18Bitcoin Signed Message:\n')
      },
      // Method 5: No prefix specified (library default)
      {
        name: 'no_prefix',
        fn: () => {
          try {
            return bitcoinMessage.verify(message, dogeAddress, signature);
          } catch { return false; }
        }
      },
    ];
    
    for (const attempt of verificationAttempts) {
      try {
        const result = attempt.fn();
        logger.info(`Verification attempt: ${attempt.name}`, { result });
        
        if (result === true) {
          isValid = true;
          successMethod = attempt.name;
          break;
        }
      } catch (error) {
        logger.debug(`Verification method ${attempt.name} threw error`, { 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  }
  
  if (!isValid) {
    logger.warn('All signature verification methods failed', { 
      dogeAddress, 
      message,
      signaturePreview: signature.substring(0, 30),
    });
    throw new UnauthorizedError('Invalid signature', 'INVALID_SIGNATURE');
  }
  
  logger.info('Signature verified successfully', { method: successMethod, dogeAddress });
  
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
  
  logger.info('User authenticated successfully', { userId: user.id, dogeAddress });
  
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
