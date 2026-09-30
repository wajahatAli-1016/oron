/// <reference types="vite/client" />
import axios, { AxiosError } from 'axios';
import { Branch } from '../types';

export interface CreateBranchRequest {
  facilityId: string;
  name: string;
  address: string;
  phone: string;
  type: string;
  status: string;
  residentLimit: number;

  branchAdminFirstName: string;
  branchAdminLastName: string;
  branchAdminEmail: string;
}

export type UpdateBranchRequest = {
  name?: string;
  address?: string;
  phone?: string;
  type?: string;
  status?: string;
  residentLimit?: number;
  branchAdminFirstName?: string;
  branchAdminLastName?: string;
  branchAdminEmail?: string;
};

const API_BASE = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) {
    return '';
  }

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
        return 'Branch API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
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

export type BranchesQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type PaginatedBranchesResponse = {
  data: Branch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const branchService = {
  async getBranches(params: BranchesQueryParams = {}): Promise<PaginatedBranchesResponse> {
    try {
      const response = await axios.get(`${getApiBase()}/branches`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params.status && params.status !== 'All' ? { status: params.status } : {}),
        },
      });

      const payload = response.data;
      if (payload && Array.isArray(payload.data) && typeof payload.total === 'number') {
        return payload as PaginatedBranchesResponse;
      }

      return {
        data: [],
        total: 0,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        totalPages: 0,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch branches'));
    }
  },

  async getAllBranches(): Promise<Branch[]> {
    const result = await this.getBranches({ page: 1, limit: 500 });
    return result.data;
  },

  async getBranchById(id: string): Promise<Branch> {
    try {
      const response = await axios.get(`${getApiBase()}/branches/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Branch;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch branch'));
    }
  },

  async createBranch(data: CreateBranchRequest): Promise<Branch> {
    try {
      const response = await axios.post(`${getApiBase()}/branches`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Branch;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create branch'));
    }
  },

  async updateBranch(id: string, data: UpdateBranchRequest): Promise<Branch> {
    try {
      const response = await axios.patch(`${getApiBase()}/branches/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Branch;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update branch'));
    }
  },
};
