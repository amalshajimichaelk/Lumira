export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

/**
 * Convert page/limit query params into Prisma skip/take values
 */
export function paginate(options: PaginationOptions): PaginationResult {
  const page = Math.max(1, options.page);
  const limit = Math.min(100, Math.max(1, options.limit));
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
}

/**
 * Calculate total pages from total count and limit
 */
export function totalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}
