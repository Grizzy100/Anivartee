import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticationError } from './errors.js';

export interface JWTPayload {
  userId: string;
  role: string;
}

export function generateAccessToken(payload: JWTPayload): string {
  // @ts-ignore - TypeScript is being overly strict with expiresIn
  return jwt.sign(payload, env.JWT_SECRET, { 
    expiresIn: env.ACCESS_TOKEN_EXPIRY 
  });
}

export function generateRefreshToken(payload: JWTPayload): string {
  // @ts-ignore - TypeScript is being overly strict with expiresIn
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { 
    expiresIn: env.REFRESH_TOKEN_EXPIRY 
  });
}

export function generateTokens(payload: JWTPayload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Access token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid access token');
    }
    throw new AuthenticationError('Token verification failed');
  }
}

export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid refresh token');
    }
    throw new AuthenticationError('Token verification failed');
  }
}
