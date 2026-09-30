import axios from "axios";
import { Alert } from "../types";

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

export type AlertPayload = Partial<Alert> & {
  targetRoles?: string[];
  healthState?: string;
};

export const normalizeAlert = (payload: AlertPayload): Alert => ({
  id: payload.id || "",
  facilityId: payload.facilityId || "",
  branchId: payload.branchId,
  residentId: payload.residentId,
  title: payload.title || "",
  message: payload.message || "",
  severity: (payload.severity || "Info") as Alert["severity"],
  status: (payload.status || "Unread") as Alert["status"],
  date: payload.date || new Date().toISOString(),
  targetRoles: (payload.targetRoles || []) as Alert["targetRoles"],
  healthState: payload.healthState as Alert["healthState"],
});

const extractArrayPayload = (payload: unknown): AlertPayload[] => {
  if (Array.isArray(payload)) return payload as AlertPayload[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: AlertPayload[] }).data;
  }
  if (Array.isArray((payload as { alerts?: unknown })?.alerts)) {
    return (payload as { alerts: AlertPayload[] }).alerts;
  }
  return [];
};

export const alertsService = {
  async getAlerts(): Promise<Alert[]> {
    const response = await axios.get(`${API_BASE}/alerts`, {
      headers: getHeaders(),
    });
    return extractArrayPayload(response.data).map(normalizeAlert);
  },

  async updateAlertStatus(id: string, status: Alert["status"]): Promise<Alert> {
    const response = await axios.patch(
      `${API_BASE}/alerts/${id}/status`,
      { status },
      { headers: getHeaders() },
    );
    return normalizeAlert(response.data as AlertPayload);
  },
};
