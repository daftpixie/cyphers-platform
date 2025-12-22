// src/middleware/auth.ts
// JWT authentication middleware for Doge wallet auth

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { prisma } from '../config/database.js';
import { UnauthorizedError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        dogeAddress: string;
        ethAddress?: string | null;
      };
    }
  }
}

// JWT payload type
interface JWTPayload {
  sub: string; // User ID
  dogeAddress: string;
  iat: number;
  exp: number;
  iss: string;
}

// Extract token from Authorization header
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  const [type, token] = authHeader.split(' ');
  
  if (type !== 'Bearer' || !token) {
    return null;
  }
  
  return token;
}

// Verify JWT and attach user to request
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new UnauthorizedError('No token provided', 'NO_TOKEN');
    }
    
    // Verify token
    const payload = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
    }) as JWTPayload;
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        dogeAddress: true,
        ethAddress: true,
      },
    });
    
    if (!user) {
      throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
    }
    
    // Verify Doge address matches
    if (user.dogeAddress !== payload.dogeAddress) {
      throw new UnauthorizedError('Token invalid', 'ADDRESS_MISMATCH');
    }
    
    // Attach user to request
    req.user = user;
    
    logger.debug('User authenticated', { userId: user.id, dogeAddress: user.dogeAddress });
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
}

// Optional auth - doesn't fail if no token
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }
    
    const payload = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
    }) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        dogeAddress: true,
        ethAddress: true,
      },
    });
    
    if (user && user.dogeAddress === payload.dogeAddress) {
      req.user = user;
    }
    
    next();
  } catch {
    // Silently continue without auth
    next();
  }
}

// Generate JWT token
export function generateToken(userId: string, dogeAddress: string): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    sub: userId,
    dogeAddress,
    iss: config.jwt.issuer,
  };
  
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    issuer: config.jwt.issuer,
  });
}

// Decode token without verification (for debugging)
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
