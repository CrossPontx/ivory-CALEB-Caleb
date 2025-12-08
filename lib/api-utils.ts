import { NextResponse } from 'next/server';

// Standard API error responses
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Common error responses
export const ApiErrors = {
  BadRequest: (message = 'Bad request') => new ApiError(400, message, 'BAD_REQUEST'),
  Unauthorized: (message = 'Unauthorized') => new ApiError(401, message, 'UNAUTHORIZED'),
  Forbidden: (message = 'Forbidden') => new ApiError(403, message, 'FORBIDDEN'),
  NotFound: (message = 'Not found') => new ApiError(404, message, 'NOT_FOUND'),
  Conflict: (message = 'Conflict') => new ApiError(409, message, 'CONFLICT'),
  InternalError: (message = 'Internal server error') => new ApiError(500, message, 'INTERNAL_ERROR'),
};

// Handle API errors consistently
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Database errors
  if (error instanceof Error) {
    if (error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Resource already exists', code: 'DUPLICATE' },
        { status: 409 }
      );
    }
    if (error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { error: 'Related resource not found', code: 'INVALID_REFERENCE' },
        { status: 400 }
      );
    }
  }

  // Generic error
  return NextResponse.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Success response helper
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

// Paginated response helper
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
) {
  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  });
}

// Validate required fields
export function validateRequired(
  body: Record<string, any>,
  fields: string[]
): void {
  const missing = fields.filter((field) => !body[field]);
  if (missing.length > 0) {
    throw ApiErrors.BadRequest(
      `Missing required fields: ${missing.join(', ')}`
    );
  }
}

// Parse query parameters
export function getQueryParam(
  url: string,
  param: string
): string | null {
  const searchParams = new URL(url).searchParams;
  return searchParams.get(param);
}

export function getQueryParamAsInt(
  url: string,
  param: string,
  defaultValue?: number
): number | undefined {
  const value = getQueryParam(url, param);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit records periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}
