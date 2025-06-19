interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  code?: string;
  details?: unknown;

  constructor({ message, code, details }: ErrorResponse) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      message: error.message,
      code: 'UNKNOWN_ERROR',
      details: error,
    });
  }

  return new AppError({
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  });
}

export function getErrorMessage(error: unknown): string {
  const appError = handleApiError(error);
  
  // Add specific error messages based on error codes
  switch (appError.code) {
    case 'UNAUTHORIZED':
      return 'Please log in to continue';
    case 'PAYMENT_REQUIRED':
      return 'Payment is required to access this feature';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many requests. Please try again later';
    case 'INVALID_INPUT':
      return 'Please check your input and try again';
    default:
      return appError.message;
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && 
    (error.message.includes('network') || 
     error.message.includes('Network') ||
     error.message.includes('Failed to fetch'));
}

// Retry logic for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !isNetworkError(error)) {
        throw handleApiError(error);
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw handleApiError(lastError);
} 