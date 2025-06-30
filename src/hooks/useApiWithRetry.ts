import { useState, useCallback } from 'react';
import { retryOperation, handleApiError, showErrorToast, logError, isNetworkError } from '../utils/errorHandler';

interface UseApiOptions {
  maxRetries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
  logErrors?: boolean;
}

export const useApiWithRetry = <T = any>(options: UseApiOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showErrorToast: showToast = true,
    logErrors = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    customOptions?: Partial<UseApiOptions>
  ): Promise<T | null> => {
    const opts = { ...options, ...customOptions };
    
    setLoading(true);
    setError(null);

    try {
      const result = await retryOperation(
        apiCall,
        opts.maxRetries || maxRetries,
        opts.retryDelay || retryDelay
      );

      setData(result);
      return result;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);

      if (opts.logErrors !== false && logErrors) {
        logError(err, { apiCall: apiCall.name });
      }

      if (opts.showErrorToast !== false && showToast) {
        showErrorToast(apiError);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [maxRetries, retryDelay, showToast, logErrors]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    isNetworkError: error ? isNetworkError(error) : false,
  };
};