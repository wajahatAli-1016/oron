import axios from 'axios';
import { Facility } from '../types';

export interface CreateFacilityRequest {
  name: string;
  phone: string;
  email: string;
  type: string;
  status: string;
  contractStart: string;
  contractEnd: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
}

export interface CreateFacilityResponse {
  facility: Facility;
  facilityAdminTemporaryPassword?: string;
}

export interface UpdateFacilityRequest {
  name: string;
  phone: string;
  email: string;
  type: string;
  status: string;
  contractStart: string;
  contractEnd: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword?: string;
}

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

const asText = (value: unknown): string | null => {
  if (typeof value === 'string') return value.trim() || null;
  if (Array.isArray(value)) {
    const parts = value
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }
  return null;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;

  const payload = error.response?.data;

  if (typeof payload === 'string') {
    if (payload.toLowerCase().includes('<!doctype') || payload.toLowerCase().includes('<html')) {
      return 'Facility API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
    }
    return payload.trim() || fallback;
  }

  if (payload && typeof payload === 'object') {
    const message = (payload as { message?: unknown; error?: unknown }).message;
    const text = asText(message) || asText((payload as { error?: unknown }).error);
    if (text) return text;
  }

  if (error.message) return error.message;
  return fallback;
};

export type FacilitiesQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type PaginatedFacilitiesResponse = {
  data: Facility[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const facilityService = {
  async getFacilities(params: FacilitiesQueryParams = {}): Promise<PaginatedFacilitiesResponse> {
    try {
      const response = await axios.get(`${getApiBase()}/facilities`, {
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
        return payload as PaginatedFacilitiesResponse;
      }

      return {
        data: [],
        total: 0,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        totalPages: 0,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch facilities'));
    }
  },

  async getAllFacilities(): Promise<Facility[]> {
    const result = await this.getFacilities({ page: 1, limit: 500 });
    return result.data;
  },

  async getFacilityById(id: string): Promise<Facility> {
    try {
      const response = await axios.get(`${getApiBase()}/facilities/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Facility;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch facility'));
    }
  },

  async createFacility(
    data: CreateFacilityRequest,
    contractDocument?: File,
  ): Promise<CreateFacilityResponse> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('type', data.type);
      formData.append('status', data.status);
      formData.append('contractStart', data.contractStart);
      formData.append('contractEnd', data.contractEnd);
      formData.append('adminFirstName', data.adminFirstName);
      formData.append('adminLastName', data.adminLastName);
      formData.append('adminEmail', data.adminEmail);

      if (contractDocument) {
        formData.append('contractDocument', contractDocument);
      }

      const response = await axios.post(`${getApiBase()}/facilities`, formData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as CreateFacilityResponse;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create facility'));
    }
  },

  async updateFacility(id: string, data: UpdateFacilityRequest): Promise<Facility> {
    try {
      const response = await axios.put(`${getApiBase()}/facilities/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Facility;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update facility'));
    }
  },
};
