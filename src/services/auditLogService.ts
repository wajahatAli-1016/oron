import axios, { AxiosError } from 'axios';
import { AuditLog } from '../types';

const API_BASE = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) return '';
  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

const getApiBase = () => {
  if (!API_BASE) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return API_BASE;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === 'string') {
      if (payload.includes('<!doctype') || payload.includes('<html')) {
        return 'Audit logs API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
      }
      return payload || fallback;
    }
    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
  }
  return fallback;
};

export type AuditLogPeriod = '7' | '30' | 'all';

export type AuditLogsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  period?: AuditLogPeriod;
};

export type PaginatedAuditLogsResponse = {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  actions: string[];
};

export const auditLogService = {
  async getAuditLogs(params: AuditLogsQueryParams = {}): Promise<PaginatedAuditLogsResponse> {
    try {
      const response = await axios.get(`${getApiBase()}/audit-logs`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params.action && params.action !== 'All' ? { action: params.action } : {}),
          ...(params.period ? { period: params.period } : {}),
        },
      });

      const payload = response.data;
      if (payload && Array.isArray(payload.data) && typeof payload.total === 'number') {
        return payload as PaginatedAuditLogsResponse;
      }
      return {
        data: [],
        total: 0,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        totalPages: 0,
        actions: [],
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch audit logs'));
    }
  },
};
