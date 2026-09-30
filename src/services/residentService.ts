import axios, { AxiosError } from 'axios';
import { normalizeEmergencyContacts, Resident } from '../types';

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

if (!API_BASE) {
  throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
}

const getJsonHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === 'string') {
      if (payload.includes('<!doctype') || payload.includes('<html')) {
        return 'Residents API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
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

export interface CreateResidentRequest {
  branchId: string;
  facilityId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: string;
  room: string;
  status: string;
  healthState: string;
  admissionDate: string;
  weight: number;
  height: string;
  emergencyContacts: Array<{
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone: string;
    relation: string;
    email?: string;
  }>;
  medicalHistory: string;
  allergies: string;
  primaryDiagnosis: string;
  lastVitalsDate?: string;
}

export type ResidentsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  healthState?: string;
  branchId?: string;
};

export type PaginatedResidentsResponse = {
  data: Resident[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const extractSingleResidentPayload = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== 'object') return null;
  if ('id' in payload && 'firstName' in payload) {
    return payload as Record<string, unknown>;
  }
  const wrapped = payload as { data?: unknown; resident?: unknown };
  if (wrapped.data && typeof wrapped.data === 'object') {
    return wrapped.data as Record<string, unknown>;
  }
  if (wrapped.resident && typeof wrapped.resident === 'object') {
    return wrapped.resident as Record<string, unknown>;
  }
  return null;
};

export const normalizeResident = (payload: unknown): Resident => {
  const raw = extractSingleResidentPayload(payload) ?? (payload as Record<string, unknown>);
  return {
    ...(raw as Resident),
    emergencyContacts: normalizeEmergencyContacts(raw?.emergencyContacts),
  };
};

export const buildResidentFormData = (
  data: CreateResidentRequest,
  residentPhoto?: File,
): FormData => {
  const formData = new FormData();
  formData.append('branchId', data.branchId);
  formData.append('facilityId', data.facilityId);
  formData.append('firstName', data.firstName);
  if (data.middleName) formData.append('middleName', data.middleName);
  formData.append('lastName', data.lastName);
  formData.append('dob', data.dob);
  formData.append('gender', data.gender);
  formData.append('room', data.room);
  formData.append('status', data.status);
  formData.append('healthState', data.healthState);
  formData.append('admissionDate', data.admissionDate);
  formData.append('weight', String(data.weight));
  formData.append('height', data.height);
  formData.append('emergencyContacts', JSON.stringify(data.emergencyContacts));
  formData.append('medicalHistory', data.medicalHistory);
  formData.append('allergies', data.allergies);
  formData.append('primaryDiagnosis', data.primaryDiagnosis);
  if (data.lastVitalsDate?.trim()) {
    formData.append('lastVitalsDate', data.lastVitalsDate.trim());
  }
  if (residentPhoto) {
    formData.append('residentPhoto', residentPhoto);
  }
  return formData;
};

export const residentService = {
  async getResidents(params: ResidentsQueryParams = {}): Promise<PaginatedResidentsResponse> {
    try {
      const response = await axios.get(`${API_BASE}/residents`, {
        headers: getJsonHeaders(),
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params.status && params.status !== 'All' ? { status: params.status } : {}),
          ...(params.healthState && params.healthState !== 'All'
            ? { healthState: params.healthState }
            : {}),
          ...(params.branchId && params.branchId !== 'All' ? { branchId: params.branchId } : {}),
        },
      });

      const payload = response.data;
      if (payload && Array.isArray(payload.data) && typeof payload.total === 'number') {
        return payload as PaginatedResidentsResponse;
      }

      return {
        data: [],
        total: 0,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        totalPages: 0,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch residents'));
    }
  },

  async getAllResidents(): Promise<Resident[]> {
    const result = await this.getResidents({ page: 1, limit: 500 });
    return result.data;
  },

  async createResident(data: CreateResidentRequest, residentPhoto?: File): Promise<Resident> {
    try {
      const formData = buildResidentFormData(data, residentPhoto);

      const response = await axios.post(`${API_BASE}/residents`, formData, {
        headers: getAuthHeaders(),
      });

      return response.data as Resident;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create resident'));
    }
  },

  async getResidentById(id: string): Promise<Resident> {
    try {
      const response = await axios.get(`${API_BASE}/residents/${id}`, {
        headers: getJsonHeaders(),
      });
      return normalizeResident(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch resident details'));
    }
  },

  async updateResident(
    id: string,
    data: CreateResidentRequest,
    residentPhoto?: File,
  ): Promise<Resident> {
    try {
      const formData = buildResidentFormData(data, residentPhoto);

      const response = await axios.put(`${API_BASE}/residents/${id}`, formData, {
        headers: getAuthHeaders(),
      });

      return response.data as Resident;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update resident'));
    }
  },
};
