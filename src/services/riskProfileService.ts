import axios, { AxiosError } from 'axios';
import type { RiskProfile } from '../types';

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
        return 'Risk Profiles API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
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

const extractArrayPayload = (payload: unknown): RiskProfile[] => {
  if (Array.isArray(payload)) return payload as RiskProfile[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: RiskProfile[] }).data;
  }
  return [];
};

export const riskProfileService = {
  async getByResident(residentId: string): Promise<RiskProfile[]> {
    try {
      const res = await axios.get(`${API_BASE}/risk-profiles/resident/${residentId}`, {
        headers: getHeaders(),
      });
      return extractArrayPayload(res.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch risk profiles'));
    }
  },

  async create(data: {
    residentId: string;
    fallRiskScore: number;
    mobilityTrend: string;
    nearFallEvents: number;
    vitalsTrend: string;
    narrativeInterpretation: string;
  }): Promise<RiskProfile> {
    try {
      const res = await axios.post(`${API_BASE}/risk-profiles`, data, { headers: getHeaders() });
      return res.data as RiskProfile;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create risk profile'));
    }
  },

  async update(
    id: string,
    data: Partial<{
      fallRiskScore: number;
      mobilityTrend: string;
      nearFallEvents: number;
      vitalsTrend: string;
      narrativeInterpretation: string;
    }>,
  ): Promise<RiskProfile> {
    try {
      const res = await axios.put(`${API_BASE}/risk-profiles/${id}`, data, { headers: getHeaders() });
      return res.data as RiskProfile;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update risk profile'));
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      const res = await axios.delete(`${API_BASE}/risk-profiles/${id}`, { headers: getHeaders() });
      return (res.data as unknown) === true;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete risk profile'));
    }
  },
};

