// ================================================
// API Error Classes
// ================================================

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Not found') {
    super(404, message, 'NOT_FOUND')
  }
}

export class BadRequestError extends APIError {
  constructor(message = 'Bad request') {
    super(400, message, 'BAD_REQUEST')
  }
}

export class InsufficientCreditsError extends APIError {
  constructor(message = 'Insufficient credits') {
    super(402, message, 'INSUFFICIENT_CREDITS')
  }
}

export class InternalServerError extends APIError {
  constructor(message = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR')
  }
}
