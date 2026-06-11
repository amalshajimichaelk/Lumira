import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

/**
 * Sign a short-lived access token (15 min)
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: 'lumira',
    audience: 'lumira-client',
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

/**
 * Verify and decode an access token — throws on expiry or invalid signature
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'lumira',
    audience: 'lumira-client',
  }) as AccessTokenPayload;
}

/**
 * Sign a longer-lived refresh token (7 days)
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    issuer: 'lumira',
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'lumira',
  }) as RefreshTokenPayload;
}
