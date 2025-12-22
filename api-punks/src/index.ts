// src/index.ts
// The Cyphers NFT Platform - API Server Entry Point

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import mintRoutes from './routes/mint.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limit for minting
const mintLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // 2 mint requests per minute
  message: { error: 'Mint rate limit exceeded. Please wait before trying again.' },
});

// ============================================
// BODY PARSING
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// REQUEST LOGGING
// ============================================

app.use(requestLogger);

// ============================================
// ROUTES
// ============================================

// Health check (no rate limit)
app.use('/health', healthRoutes);

// API routes
app.use('/auth', authRoutes);
app.use('/mint', mintLimiter, mintRoutes);
app.use('/cyphers', galleryRoutes);
app.use('/portfolio', galleryRoutes);

// API documentation redirect
app.get('/docs', (_req, res) => {
  res.redirect('https://github.com/24hrmvp/cyphers-platform#api-endpoints-reference');
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'The Cyphers API',
    version: '1.0.0',
    description: 'NFT Platform API for punks.24hrmvp.xyz',
    endpoints: {
      health: '/health',
      auth: '/auth/doge/*',
      mint: '/mint/*',
      gallery: '/cyphers',
      portfolio: '/portfolio/:address',
    },
    links: {
      frontend: 'https://punks.24hrmvp.xyz',
      mainPlatform: 'https://24hrmvp.xyz',
      docs: '/docs',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🔐 The Cyphers API running on port ${PORT}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
  logger.info(`🌐 CORS Origin: ${config.corsOrigin}`);
  logger.info(`🎨 Ready to encrypt identities!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
