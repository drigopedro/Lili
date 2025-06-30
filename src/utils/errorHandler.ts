import { toast } from './toast';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error: any): ApiError => {
  // Network error
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }

  const { status, data } = error.response;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return {
        message: data?.message || 'Invalid request. Please check your input.',
        status,
        code: 'BAD_REQUEST',
        details: data?.details,
      };

    case 401:
      return {
        message: 'Authentication required. Please log in again.',
        status,
        code: 'UNAUTHORIZED',
      };

    case 403:
      return {
        message: 'Access denied. You don\'t have permission for this action.',
        status,
        code: 'FORBIDDEN',
      };

    case 404:
      return {
        message: 'Resource not found.',
        status,
        code: 'NOT_FOUND',
      };

    case 409:
      return {
        message: data?.message || 'Conflict. This resource already exists.',
        status,
        code: 'CONFLICT',
      };

    case 422:
      return {
        message: data?.message || 'Validation error. Please check your input.',
        status,
        code: 'VALIDATION_ERROR',
        details: data?.details,
      };

    case 429:
      return {
        message: 'Too many requests. Please try again later.',
        status,
        code: 'RATE_LIMITED',
      };

    case 500:
      return {
        message: 'Server error. Please try again later.',
        status,
        code: 'INTERNAL_ERROR',
      };

    case 503:
      return {
        message: 'Service temporarily unavailable. Please try again later.',
        status,
        code: 'SERVICE_UNAVAILABLE',
      };

    default:
      return {
        message: data?.message || 'An unexpected error occurred.',
        status,
        code: 'UNKNOWN_ERROR',
      };
  }
};

export const showErrorToast = (error: ApiError | Error | string) => {
  let message: string;

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof AppError) {
    message = error.message;
  } else if ('message' in error) {
    message = error.message;
  } else {
    message = 'An unexpected error occurred';
  }

  toast.error(message);
};

export const logError = (error: Error | ApiError, context?: any) => {
  const errorData = {
    message: error.message,
    stack: 'stack' in error ? error.stack : undefined,
    status: 'status' in error ? error.status : undefined,
    code: 'code' in error ? error.code : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorData);
  }

  // In production, send to monitoring service
  // Example: Sentry, LogRocket, etc.
  // monitoringService.captureException(error, { extra: errorData });
};

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

export const isNetworkError = (error: any): boolean => {
  return !error.response || error.code === 'NETWORK_ERROR';
};

export const isAuthError = (error: any): boolean => {
  return error.status === 401 || error.code === 'UNAUTHORIZED';
};

export const isValidationError = (error: any): boolean => {
  return error.status === 422 || error.code === 'VALIDATION_ERROR';
};