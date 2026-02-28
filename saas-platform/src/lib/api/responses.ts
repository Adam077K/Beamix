// ================================================
// API Response Helpers
// ================================================

import { NextResponse } from 'next/server'
import { APIError } from './errors'

export interface SuccessResponse<T = any> {
  success: true
  data: T
  meta?: {
    timestamp: string
    [key: string]: any
  }
}

export interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: any
  }
  meta?: {
    timestamp: string
    [key: string]: any
  }
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  })
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: Error | APIError,
  statusCode: number = 500
): NextResponse<ErrorResponse> {
  const isAPIError = error instanceof APIError

  return NextResponse.json(
    {
      success: false,
      error: {
        message: error.message,
        code: isAPIError ? error.code : 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: isAPIError ? error.statusCode : statusCode }
  )
}

/**
 * Wrap an API route handler with error handling
 */
export function withErrorHandler<T extends any[] = any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T) => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('[API Error]', error)
      
      if (error instanceof APIError) {
        return errorResponse(error)
      }
      
      return errorResponse(error as Error, 500)
    }
  }
}
