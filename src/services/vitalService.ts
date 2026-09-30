import axios from "axios";
import { Vital } from "../types";

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("Missing VITE_API_URL. Set your backend API URL in frontend .env.");
}

const getAuthToken = () => {
  const auth = localStorage.getItem("oron_auth");
  if (!auth) return "";
  try {
    return (JSON.parse(auth) as { token?: string }).token || "";
  } catch {
    return "";
  }
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

export interface CreateVitalRequest {
  residentId: string;
  date: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  bloodSugar?: number;
  weight?: number;
  respiratoryRate?: number;
  notes?: string;
}

export const normalizeVital = (payload: Partial<Vital>): Vital => ({
  id: payload.id || "",
  residentId: payload.residentId || "",
  branchId: payload.branchId || "",
  facilityId: payload.facilityId,
  date: payload.date || new Date().toISOString(),
  systolicBP: payload.systolicBP,
  diastolicBP: payload.diastolicBP,
  heartRate: payload.heartRate,
  temperature: payload.temperature,
  oxygenSaturation: payload.oxygenSaturation,
  bloodSugar: payload.bloodSugar,
  weight: payload.weight,
  respiratoryRate: payload.respiratoryRate,
  recordedBy: payload.recordedBy,
  recordedById: payload.recordedById,
  thresholdEvaluation: payload.thresholdEvaluation,
  clinicalHealthState: payload.clinicalHealthState,
  recommendedAction: payload.recommendedAction,
  notes: payload.notes,
});

const extractArrayPayload = (payload: unknown): Partial<Vital>[] => {
  if (Array.isArray(payload)) return payload as Partial<Vital>[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: Partial<Vital>[] }).data;
  }
  if (Array.isArray((payload as { vitals?: unknown })?.vitals)) {
    return (payload as { vitals: Partial<Vital>[] }).vitals;
  }
  return [];
};

export const vitalService = {
  async createVital(data: CreateVitalRequest): Promise<Vital> {
    const response = await axios.post(`${API_BASE}/vitals`, data, {
      headers: getHeaders(),
    });
    return normalizeVital(response.data as Partial<Vital>);
  },

  async getAllVitals(): Promise<Vital[]> {
    const response = await axios.get(`${API_BASE}/vitals`, {
      headers: getHeaders(),
    });
    return extractArrayPayload(response.data).map(normalizeVital);
  },

  async getVitalsByResident(residentId: string): Promise<Vital[]> {
    const response = await axios.get(`${API_BASE}/vitals/resident/${residentId}`, {
      headers: getHeaders(),
    });
    return extractArrayPayload(response.data).map(normalizeVital);
  },
};
