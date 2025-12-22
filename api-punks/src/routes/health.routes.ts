// src/routes/health.routes.ts
// Health check endpoints for monitoring

import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database.js';

const router = Router();

// Basic health check
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'api-punks',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Detailed health check with dependencies
router.get('/detailed', async (_req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseConnection();
  
  const health = {
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      database: {
        status: dbHealthy ? 'ok' : 'error',
        latency: null as number | null,
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      uptime: {
        seconds: Math.round(process.uptime()),
      },
    },
  };
  
  res.status(dbHealthy ? 200 : 503).json(health);
});

// Readiness probe for Kubernetes/Railway
router.get('/ready', async (_req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseConnection();
  
  if (dbHealthy) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Database connection failed' });
  }
});

// Liveness probe
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

export default router;
