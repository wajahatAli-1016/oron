import axios, { AxiosError } from 'axios';
import type { Intervention } from '../types';

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
}

const getAuthToken = () => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) return '';
  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === 'string') {
      if (payload.includes('<!doctype') || payload.includes('<html')) {
        return 'Interventions API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
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

const extractArrayPayload = (payload: unknown): Intervention[] => {
  if (Array.isArray(payload)) return payload as Intervention[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: Intervention[] }).data;
  }
  return [];
};

export const interventionsService = {
  async getByResident(residentId: string): Promise<Intervention[]> {
    try {
      const res = await axios.get(`${API_BASE}/interventions/resident/${residentId}`, {
        headers: getHeaders(),
      });
      return extractArrayPayload(res.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch interventions'));
    }
  },

  async create(data: {
    residentId: string;
    description: string;
    responsibleStaffRole: string;
    frequency: string;
    triggerConditions: string;
    effectivenessMetric: string;
  }): Promise<Intervention> {
    try {
      const res = await axios.post(`${API_BASE}/interventions`, data, { headers: getHeaders() });
      return res.data as Intervention;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create intervention'));
    }
  },

  async update(
    id: string,
    data: Partial<{
      description: string;
      responsibleStaffRole: string;
      frequency: string;
      triggerConditions: string;
      effectivenessMetric: string;
    }>,
  ): Promise<Intervention> {
    try {
      const res = await axios.put(`${API_BASE}/interventions/${id}`, data, { headers: getHeaders() });
      return res.data as Intervention;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update intervention'));
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      const res = await axios.delete(`${API_BASE}/interventions/${id}`, { headers: getHeaders() });
      return (res.data as unknown) === true;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete intervention'));
    }
  },
};

