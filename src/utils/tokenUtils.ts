import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export function generateToken(userId: number, email: string): string {
  const options: SignOptions = { expiresIn: ENV.JWT_EXPIRY as any };
  return jwt.sign({ userId, email }, ENV.JWT_SECRET, options);
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as { userId: number; email: string };
  } catch {
    return null;
  }
}

export function generateAdminToken(): string {
  return jwt.sign({ admin: true }, ENV.JWT_SECRET, { expiresIn: '1d' });
}
