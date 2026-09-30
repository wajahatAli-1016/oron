import axios from 'axios';
import { StaffMember } from '../types';

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

export interface CreateStaffRequest {
  branchId: string;
  facilityId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: StaffMember['role'];
  status: StaffMember['status'];
  permissions: string[];
}

export interface UpdateStaffRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  role: StaffMember['role'];
  status: StaffMember['status'];
  permissions: string[];
}

type StaffApiPayload = Partial<StaffMember> & { id?: string; _id?: string; staffRole?: string };

const DEFAULT_STAFF_ROLE_OPTIONS = ['Caregiver', 'Nurse', 'Coordinator'] as const;

/** Unique staffRole / role labels from API rows (preserves custom roles). */
export const collectUniqueStaffRoles = (items: StaffApiPayload[]): string[] => {
  const roles = new Set<string>();
  for (const item of items) {
    const label = String(item.staffRole ?? item.role ?? '').trim();
    if (label) roles.add(label);
  }
  if (roles.size === 0) {
    DEFAULT_STAFF_ROLE_OPTIONS.forEach((r) => roles.add(r));
  }
  return [...roles].sort((a, b) => a.localeCompare(b));
};

const normalizeRole = (role?: string): StaffMember['role'] => {
  if (!role) return 'Caregiver';
  const normalized = role.toLowerCase();
  if (normalized.includes('nurse')) return 'Nurse';
  if (normalized.includes('coord')) return 'Coordinator';
  return 'Caregiver';
};

const normalizeStatus = (status?: string): StaffMember['status'] => {
  if (!status) return 'Active';
  return status.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
};

export const normalizeStaff = (item: StaffApiPayload): StaffMember => ({
  id: item.id || item._id || '',
  branchId: item.branchId || '',
  facilityId: item.facilityId || '',
  firstName: item.firstName || '',
  middleName: item.middleName || '',
  lastName: item.lastName || '',
  email: item.email || '',
  role: normalizeRole(item.role),
  status: normalizeStatus(item.status),
  lastActive: item.lastActive ?? '',
  permissions: Array.isArray(item.permissions) ? item.permissions : [],
});

const extractArrayPayload = (payload: unknown): StaffApiPayload[] => {
  if (Array.isArray(payload)) return payload as StaffApiPayload[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: StaffApiPayload[] }).data;
  }
  if (Array.isArray((payload as { staff?: unknown })?.staff)) {
    return (payload as { staff: StaffApiPayload[] }).staff;
  }
  return [];
};

export const extractSingleStaffPayload = (payload: unknown): StaffApiPayload => {
  if ((payload as StaffApiPayload)?.id || (payload as StaffApiPayload)?._id) {
    return payload as StaffApiPayload;
  }
  if ((payload as { data?: StaffApiPayload })?.data) {
    return (payload as { data: StaffApiPayload }).data;
  }
  if ((payload as { staff?: StaffApiPayload })?.staff) {
    return (payload as { staff: StaffApiPayload }).staff;
  }
  return {} as StaffApiPayload;
};

export type StaffQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
};

export type PaginatedStaffResponse = {
  data: StaffMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const extractPaginatedStaffPayload = (payload: unknown): PaginatedStaffResponse | null => {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as PaginatedStaffResponse).data) &&
    typeof (payload as PaginatedStaffResponse).total === 'number'
  ) {
    const paginated = payload as PaginatedStaffResponse;
    return {
      ...paginated,
      data: paginated.data.map((item) =>
        normalizeStaff(item as StaffApiPayload),
      ),
    };
  }
  return null;
};

export const staffService = {
  async getStaff(params: StaffQueryParams = {}): Promise<PaginatedStaffResponse> {
    const response = await axios.get(`${API_BASE}/staff`, {
      headers: getHeaders(),
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params.branchId && params.branchId !== 'All'
          ? { branchId: params.branchId }
          : {}),
      },
    });

    const paginated = extractPaginatedStaffPayload(response.data);
    if (paginated) {
      return paginated;
    }

    return {
      data: [],
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 0,
    };
  },

  async getAllStaff(): Promise<StaffMember[]> {
    const result = await this.getStaff({ page: 1, limit: 500 });
    return result.data;
  },

  async getStaffRoleOptions(params: { branchId?: string } = {}): Promise<string[]> {
    const response = await axios.get(`${API_BASE}/staff`, {
      headers: getHeaders(),
      params: {
        page: 1,
        limit: 500,
        ...(params.branchId && params.branchId !== 'All'
          ? { branchId: params.branchId }
          : {}),
      },
    });
    return collectUniqueStaffRoles(extractArrayPayload(response.data));
  },

  async getStaffById(id: string): Promise<StaffMember> {
    const response = await axios.get(`${API_BASE}/staff/${id}`, {
      headers: getHeaders(),
    });
    return normalizeStaff(extractSingleStaffPayload(response.data));
  },

  async createStaff(data: CreateStaffRequest): Promise<StaffMember> {
    const response = await axios.post(`${API_BASE}/staff`, data, {
      headers: getHeaders(),
    });
    return normalizeStaff(extractSingleStaffPayload(response.data));
  },

  async updateStaff(id: string, data: UpdateStaffRequest): Promise<StaffMember> {
    const response = await axios.put(`${API_BASE}/staff/${id}`, data, {
      headers: getHeaders(),
    });
    return normalizeStaff(extractSingleStaffPayload(response.data));
  },
};
