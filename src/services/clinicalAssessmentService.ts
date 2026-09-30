import axios, { AxiosError } from 'axios';
import type { ClinicalAssessment } from '../types';

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
    if (typeof payload === 'string') return payload || fallback;
    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
  }
  return fallback;
};

const extractArrayPayload = (payload: unknown): ClinicalAssessment[] => {
  if (Array.isArray(payload)) return payload as ClinicalAssessment[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: ClinicalAssessment[] }).data;
  }
  return [];
};

export const clinicalAssessmentService = {
  async getByResident(residentId: string): Promise<ClinicalAssessment[]> {
    try {
      const res = await axios.get(`${API_BASE}/clinical-assessments/resident/${residentId}`, {
        headers: getHeaders(),
      });
      return extractArrayPayload(res.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch clinical assessments'));
    }
  },

  async create(data: {
    residentId: string;
    conditions: string[];
    allergies: string[];
    adlScores: Record<string, string>;
    mobility: string;
    cognitive: string;
  }): Promise<ClinicalAssessment> {
    try {
      const res = await axios.post(`${API_BASE}/clinical-assessments`, data, { headers: getHeaders() });
      return res.data as ClinicalAssessment;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create clinical assessment'));
    }
  },

  async update(
    id: string,
    data: Partial<{
      conditions: string[];
      allergies: string[];
      adlScores: Record<string, string>;
      mobility: string;
      cognitive: string;
    }>,
  ): Promise<ClinicalAssessment> {
    try {
      const res = await axios.put(`${API_BASE}/clinical-assessments/${id}`, data, { headers: getHeaders() });
      return res.data as ClinicalAssessment;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update clinical assessment'));
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      const res = await axios.delete(`${API_BASE}/clinical-assessments/${id}`, { headers: getHeaders() });
      return (res.data as unknown) === true;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete clinical assessment'));
    }
  },
};

