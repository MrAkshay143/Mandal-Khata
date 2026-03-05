import { PaginationParams } from '../types/globalTypes.js';
import { APP_CONSTANTS } from '../constants/appConstants.js';

export function generateUsername(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}_${rand}`;
}

export function getPaginationQuery(params: PaginationParams) {
  const limit = params.limit ? Math.min(Number(params.limit), 100) : APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT;
  const offset = params.offset ? Number(params.offset) : 0;
  return { limit, offset };
}
