// src/config/database.ts
// Prisma client singleton for database connections

import { PrismaClient } from '@prisma/client';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with logging configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: config.isDev 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  errorFormat: config.isDev ? 'pretty' : 'minimal',
});

// Store in global to prevent hot reload issues
if (config.isDev) {
  globalForPrisma.prisma = prisma;
}

// Connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection established');
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}

// Initialize token counter if not exists
export async function initializeTokenCounter(): Promise<void> {
  const existing = await prisma.tokenCounter.findFirst();
  if (!existing) {
    await prisma.tokenCounter.create({
      data: {
        lastTokenId: 0,
        maxSupply: config.mint.maxSupply,
      },
    });
    logger.info('Token counter initialized');
  }
}

// Get next available token ID (atomic operation)
export async function getNextTokenId(): Promise<number | null> {
  const result = await prisma.$transaction(async (tx) => {
    const counter = await tx.tokenCounter.findFirst();
    if (!counter) {
      throw new Error('Token counter not initialized');
    }
    
    if (counter.lastTokenId >= counter.maxSupply) {
      return null; // Sold out
    }
    
    const nextId = counter.lastTokenId + 1;
    
    await tx.tokenCounter.update({
      where: { id: counter.id },
      data: { lastTokenId: nextId },
    });
    
    return nextId;
  });
  
  return result;
}

export default prisma;
