import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenUtils.js';
import { AuthRequest } from '../types/globalTypes.js';

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.userId = payload.userId;
  req.userEmail = payload.email;
  next();
}
