import axios from "axios";
import { Rule, RuleThreshold, VitalType } from "../types";

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

type RuleApiPayload = Partial<Rule> & { id?: string; _id?: string };

const allowedVitalTypes: VitalType[] = [
  "systolicBP",
  "diastolicBP",
  "heartRate",
  "oxygenSaturation",
  "temperature",
  "bloodSugar",
];

const normalizeThresholds = (thresholds?: Partial<RuleThreshold>): RuleThreshold => ({
  normalMin: Number(thresholds?.normalMin ?? 0),
  normalMax: Number(thresholds?.normalMax ?? 0),
  lowThreshold: Number(thresholds?.lowThreshold ?? 0),
  highThreshold: Number(thresholds?.highThreshold ?? 0),
  criticalLow: Number(thresholds?.criticalLow ?? 0),
  criticalHigh: Number(thresholds?.criticalHigh ?? 0),
  unit: String(thresholds?.unit ?? ""),
});

export const normalizeRule = (item: RuleApiPayload): Rule => {
  const vitalType = String(item.vitalType ?? "heartRate") as VitalType;
  return {
    id: item.id || item._id || "",
    name: String(item.name ?? ""),
    vitalType: allowedVitalTypes.includes(vitalType) ? vitalType : "heartRate",
    category: "Vitals",
    thresholds: normalizeThresholds(item.thresholds),
    isActive: Boolean(item.isActive ?? true),
    description: String(item.description ?? ""),
  };
};

const extractArrayPayload = (payload: unknown): RuleApiPayload[] => {
  if (Array.isArray(payload)) return payload as RuleApiPayload[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: RuleApiPayload[] }).data;
  }
  if (Array.isArray((payload as { rules?: unknown })?.rules)) {
    return (payload as { rules: RuleApiPayload[] }).rules;
  }
  return [];
};

const extractSinglePayload = (payload: unknown): RuleApiPayload => {
  if ((payload as RuleApiPayload)?.id || (payload as RuleApiPayload)?._id) {
    return payload as RuleApiPayload;
  }
  if ((payload as { data?: RuleApiPayload })?.data) {
    return (payload as { data: RuleApiPayload }).data;
  }
  if ((payload as { rule?: RuleApiPayload })?.rule) {
    return (payload as { rule: RuleApiPayload }).rule;
  }
  return {} as RuleApiPayload;
};

export const parseRulesApiResponse = (payload: unknown): Rule[] =>
  extractArrayPayload(payload).map(normalizeRule);

export const rulesService = {
  async getAllRules(): Promise<Rule[]> {
    const response = await axios.get(`${API_BASE}/rules`, {
      headers: getHeaders(),
    });
    return parseRulesApiResponse(response.data);
  },

  async updateRule(id: string, data: Partial<Rule>): Promise<Rule> {
    const response = await axios.put(`${API_BASE}/rules/${id}`, data, {
      headers: getHeaders(),
    });
    return normalizeRule(extractSinglePayload(response.data));
  },
};

