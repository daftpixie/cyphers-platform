// src/services/doge.service.ts
// Dogecoin wallet authentication and signature verification

import bitcoinMessage from 'bitcoinjs-message';
import { createHash } from 'crypto';
import * as secp256k1 from 'secp256k1';
import bs58check from 'bs58check';
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

// Dogecoin network configuration
const DOGECOIN_NETWORK = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,  // 30 in decimal - addresses start with 'D'
  scriptHash: 0x16,  // 22 in decimal
  wif: 0x9e,         // 158 in decimal
};

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
 * SHA256 hash
 */
function sha256(buffer: Buffer): Buffer {
  return createHash('sha256').update(buffer).digest();
}

/**
 * Variable integer encoding helpers
 */
function varintBufNum(n: number): Buffer {
  if (n < 253) {
    return Buffer.from([n]);
  } else if (n < 0x10000) {
    const buf = Buffer.alloc(3);
    buf[0] = 253;
    buf.writeUInt16LE(n, 1);
    return buf;
  } else if (n < 0x100000000) {
    const buf = Buffer.alloc(5);
    buf[0] = 254;
    buf.writeUInt32LE(n, 1);
    return buf;
  } else {
    const buf = Buffer.alloc(9);
    buf[0] = 255;
    buf.writeBigUInt64LE(BigInt(n), 1);
    return buf;
  }
}

/**
 * Calculate magic hash for message verification (Dogecoin format)
 */
function magicHash(message: string, messagePrefix: string): Buffer {
  const prefix = Buffer.from(messagePrefix, 'utf8');
  const messageBuffer = Buffer.from(message, 'utf8');
  const messageVarInt = varintBufNum(messageBuffer.length);
  
  const buffer = Buffer.concat([prefix, messageVarInt, messageBuffer]);
  return sha256(sha256(buffer));
}

/**
 * Get public key hash from public key (RIPEMD160(SHA256(pubkey)))
 */
function hash160(buffer: Buffer): Buffer {
  const sha = createHash('sha256').update(buffer).digest();
  return createHash('ripemd160').update(sha).digest();
}

/**
 * Encode public key hash to Dogecoin address
 */
function encodeDogeAddress(hash: Buffer, version: number = DOGECOIN_NETWORK.pubKeyHash): string {
  const payload = Buffer.concat([Buffer.from([version]), hash]);
  return bs58check.encode(payload);
}

/**
 * Custom Dogecoin signature verification
 * This handles the specific message format and address encoding
 */
function verifyDogeSignature(message: string, address: string, signatureBase64: string): boolean {
  try {
    // Decode the signature from base64
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');
    
    if (signatureBuffer.length !== 65) {
      logger.debug('Invalid signature length', { length: signatureBuffer.length });
      return false;
    }
    
    // Extract recovery flag and signature
    const flagByte = signatureBuffer[0] - 27;
    const recovery = flagByte & 3;
    const compressed = !!(flagByte & 4);
    
    logger.debug('Signature details', {
      flagByte: signatureBuffer[0],
      recovery,
      compressed,
    });
    
    // Get the r,s signature (remove header byte)
    const signature = signatureBuffer.slice(1);
    
    // Calculate message hash with Dogecoin prefix
    const hash = magicHash(message, DOGECOIN_NETWORK.messagePrefix);
    
    // Recover public key from signature
    let publicKey: Uint8Array;
    try {
      publicKey = secp256k1.ecdsaRecover(signature, recovery, hash, compressed);
    } catch (e) {
      logger.debug('Failed to recover public key', { error: String(e) });
      return false;
    }
    
    // Derive address from recovered public key
    const pubKeyHash = hash160(Buffer.from(publicKey));
    const recoveredAddress = encodeDogeAddress(pubKeyHash);
    
    logger.debug('Address comparison', {
      providedAddress: address,
      recoveredAddress,
      match: recoveredAddress === address,
    });
    
    // Check if recovered address matches
    return recoveredAddress === address;
  } catch (error) {
    logger.debug('Custom verification error', { error: String(error) });
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
    await prisma.authChallenge.delete({ where: { nonce } });
    throw new UnauthorizedError('Challenge expired', 'CHALLENGE_EXPIRED');
  }
  
  // If address was specified in challenge, verify it matches
  if (challenge.dogeAddress && challenge.dogeAddress !== dogeAddress) {
    throw new UnauthorizedError('Address mismatch', 'ADDRESS_MISMATCH');
  }
  
  // Construct the message that was signed
  const message = MESSAGE_TEMPLATE.replace('{nonce}', nonce);
  
  // Log for debugging
  logger.info('Attempting signature verification', { 
    message, 
    dogeAddress, 
    signatureLength: signature.length,
    signaturePreview: signature.substring(0, 30) + '...',
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
    // Method 1: Custom Dogecoin verification (most reliable)
    try {
      isValid = verifyDogeSignature(message, dogeAddress, signature);
      if (isValid) successMethod = 'custom_doge_verify';
      logger.info('Method 1 (custom Doge verify) result:', { isValid });
    } catch (e) {
      logger.debug('Method 1 failed', { error: String(e) });
    }
    
    // Method 2: bitcoinjs-message with Dogecoin prefix
    if (!isValid) {
      try {
        isValid = bitcoinMessage.verify(
          message, 
          dogeAddress, 
          signature, 
          DOGECOIN_NETWORK.messagePrefix
        );
        if (isValid) successMethod = 'bitcoinjs_doge_prefix';
        logger.info('Method 2 (bitcoinjs Doge prefix) result:', { isValid });
      } catch (e) {
        logger.debug('Method 2 failed', { error: String(e) });
      }
    }
    
    // Method 3: bitcoinjs-message with buffer signature
    if (!isValid) {
      try {
        const sigBuffer = Buffer.from(signature, 'base64');
        isValid = bitcoinMessage.verify(
          message, 
          dogeAddress, 
          sigBuffer, 
          DOGECOIN_NETWORK.messagePrefix
        );
        if (isValid) successMethod = 'bitcoinjs_buffer';
        logger.info('Method 3 (bitcoinjs buffer) result:', { isValid });
      } catch (e) {
        logger.debug('Method 3 failed', { error: String(e) });
      }
    }
    
    // Method 4: bitcoinjs-message with checkSegwitAlways
    if (!isValid) {
      try {
        isValid = bitcoinMessage.verify(
          message, 
          dogeAddress, 
          signature, 
          DOGECOIN_NETWORK.messagePrefix,
          true  // checkSegwitAlways
        );
        if (isValid) successMethod = 'bitcoinjs_segwit';
        logger.info('Method 4 (bitcoinjs segwit) result:', { isValid });
      } catch (e) {
        logger.debug('Method 4 failed', { error: String(e) });
      }
    }
    
    // Method 5: No prefix (default Bitcoin)
    if (!isValid) {
      try {
        isValid = bitcoinMessage.verify(message, dogeAddress, signature);
        if (isValid) successMethod = 'bitcoinjs_default';
        logger.info('Method 5 (bitcoinjs default) result:', { isValid });
      } catch (e) {
        logger.debug('Method 5 failed', { error: String(e) });
      }
    }
  }
  
  if (!isValid) {
    logger.warn('All signature verification methods failed', { 
      dogeAddress, 
      signature: signature.substring(0, 50),
      message,
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
