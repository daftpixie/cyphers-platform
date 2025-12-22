// src/config/env.ts
// Environment configuration with validation

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  // Server
  PORT: z.string().default('3002'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ISSUER: z.string().default('punks.24hrmvp.xyz'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // AI Generation
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  
  // IPFS (Pinata)
  PINATA_API_KEY: z.string().optional(),
  PINATA_SECRET_KEY: z.string().optional(),
  PINATA_JWT: z.string().optional(),
  
  // Dogecoin RPC
  DOGE_RPC_URL: z.string().default('http://localhost:22555'),
  DOGE_RPC_USER: z.string().optional(),
  DOGE_RPC_PASS: z.string().optional(),
  
  // Minting Configuration
  INSCRIPTION_FEE_ADDRESS: z.string().optional(),
  MINT_PRICE_DOGE: z.string().default('100'),
  MAX_SUPPLY: z.string().default('1000'),
  
  // Redis (optional for queues)
  REDIS_URL: z.string().optional(),
  
  // Main platform link
  MAIN_PLATFORM_URL: z.string().default('https://24hrmvp.xyz'),
});

// Parse and validate
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  
  // In development, provide helpful defaults
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ Running with partial configuration in development mode');
  } else {
    process.exit(1);
  }
}

const env = parseResult.success ? parseResult.data : {
  PORT: process.env.PORT || '3002',
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production-32chars',
  JWT_ISSUER: process.env.JWT_ISSUER || 'punks.24hrmvp.xyz',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
  PINATA_JWT: process.env.PINATA_JWT,
  DOGE_RPC_URL: process.env.DOGE_RPC_URL || 'http://localhost:22555',
  DOGE_RPC_USER: process.env.DOGE_RPC_USER,
  DOGE_RPC_PASS: process.env.DOGE_RPC_PASS,
  INSCRIPTION_FEE_ADDRESS: process.env.INSCRIPTION_FEE_ADDRESS,
  MINT_PRICE_DOGE: process.env.MINT_PRICE_DOGE || '100',
  MAX_SUPPLY: process.env.MAX_SUPPLY || '1000',
  REDIS_URL: process.env.REDIS_URL,
  MAIN_PLATFORM_URL: process.env.MAIN_PLATFORM_URL || 'https://24hrmvp.xyz',
};

// Export typed configuration
export const config = {
  // Server
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  
  // CORS
  corsOrigin: env.CORS_ORIGIN,
  
  // Database
  databaseUrl: env.DATABASE_URL,
  
  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    issuer: env.JWT_ISSUER,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  
  // AI
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
  },
  
  // IPFS
  pinata: {
    apiKey: env.PINATA_API_KEY,
    secretKey: env.PINATA_SECRET_KEY,
    jwt: env.PINATA_JWT,
  },
  
  // Dogecoin
  doge: {
    rpcUrl: env.DOGE_RPC_URL,
    rpcUser: env.DOGE_RPC_USER,
    rpcPass: env.DOGE_RPC_PASS,
    feeAddress: env.INSCRIPTION_FEE_ADDRESS,
  },
  
  // Minting
  mint: {
    priceDoge: parseFloat(env.MINT_PRICE_DOGE),
    maxSupply: parseInt(env.MAX_SUPPLY, 10),
  },
  
  // Redis
  redisUrl: env.REDIS_URL,
  
  // Links
  mainPlatformUrl: env.MAIN_PLATFORM_URL,
} as const;

export type Config = typeof config;
