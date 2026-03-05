import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}
