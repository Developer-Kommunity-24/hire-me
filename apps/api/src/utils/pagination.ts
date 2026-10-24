// ==========================================
// PAGINATION HELPERS
// ==========================================

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const

/**
 * Computes offset from 1-based page number and limit.
 */
export function pageToOffset(page: number, limit: number): number {
  return (page - 1) * limit
}

/**
 * Builds the pagination metadata object returned in API responses.
 */
export function buildPaginationMeta(
  total: number,
  { page, limit }: PaginationParams,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}
