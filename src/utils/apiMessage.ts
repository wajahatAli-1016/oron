import axios from 'axios';

type RtkFetchLikeError = {
  status: number | string;
  data?: unknown;
  error?: string;
};

const isRtkFetchLikeError = (error: unknown): error is RtkFetchLikeError =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  ('data' in error || 'error' in error);

type ApiPayload = {
  message?: unknown;
  error?: unknown;
  details?: unknown;
};

const toText = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value.trim() || null;
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }
  return null;
};

const extractFromPayload = (payload: unknown): string | null => {
  if (!payload) return null;

  const direct = toText(payload);
  if (direct) return direct;

  if (typeof payload === 'object') {
    const apiPayload = payload as ApiPayload;
    return (
      toText(apiPayload.message) ||
      toText(apiPayload.details) ||
      toText(apiPayload.error)
    );
  }

  return null;
};

export const INTERNAL_SERVER_ERROR_MESSAGE =
  'Internal server error. Please try again later.';

const isGenericNetworkMessage = (message: string): boolean => {
  const normalized = message.trim().toLowerCase();
  return (
    normalized === 'failed to fetch' ||
    normalized.includes('network error') ||
    normalized.includes('network request failed') ||
    normalized === 'load failed'
  );
};

const isServerFailureStatus = (status: number | string): boolean => {
  if (status === 'FETCH_ERROR' || status === 'PARSING_ERROR' || status === 'TIMEOUT_ERROR') {
    return true;
  }
  return typeof status === 'number' && status >= 500;
};

export const getApiSuccessMessage = (
  payload: unknown,
  fallback = 'Operation completed successfully.',
): string => {
  return extractFromPayload(payload) || fallback;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (isRtkFetchLikeError(error)) {
    const messageFromPayload = extractFromPayload(error.data);
    if (isServerFailureStatus(error.status)) {
      return messageFromPayload || INTERNAL_SERVER_ERROR_MESSAGE;
    }
    if (messageFromPayload) return messageFromPayload;
    if (typeof error.error === 'string' && error.error) {
      return isGenericNetworkMessage(error.error)
        ? INTERNAL_SERVER_ERROR_MESSAGE
        : error.error;
    }
    return fallback;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return INTERNAL_SERVER_ERROR_MESSAGE;
    }
    const messageFromPayload = extractFromPayload(error.response.data);
    if (error.response.status >= 500) {
      return messageFromPayload || INTERNAL_SERVER_ERROR_MESSAGE;
    }
    if (messageFromPayload) return messageFromPayload;
    if (error.message && !isGenericNetworkMessage(error.message)) return error.message;
    return fallback;
  }

  if (error instanceof Error) {
    if (isGenericNetworkMessage(error.message)) {
      return INTERNAL_SERVER_ERROR_MESSAGE;
    }
    return error.message || fallback;
  }

  const message = extractFromPayload(error);
  return message || fallback;
};
