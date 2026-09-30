import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Facility,
  Branch,
  Resident,
  Alert,
  Rule,
  AuditLog,
  User,
  StaffMember,
  Task,
  Vital,
} from '../../types';
import { normalizeAlert, type AlertPayload } from '../../services/alertsService';
import { parseRulesApiResponse } from '../../services/rulesService';
import type {
  CreateFacilityResponse,
  UpdateFacilityRequest,
  FacilitiesQueryParams,
  PaginatedFacilitiesResponse,
} from '../../services/facilityService';
import type {
  AuditLogsQueryParams,
  PaginatedAuditLogsResponse,
} from '../../services/auditLogService';
import type {
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchesQueryParams,
  PaginatedBranchesResponse,
} from '../../services/branchService';
import type {
  CreateResidentRequest,
  ResidentsQueryParams,
  PaginatedResidentsResponse,
} from '../../services/residentService';
import { buildResidentFormData, normalizeResident } from '../../services/residentService';
import type {
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffQueryParams,
  PaginatedStaffResponse,
} from '../../services/staffService';
import {
  normalizeStaff,
  extractPaginatedStaffPayload,
  extractSingleStaffPayload,
} from '../../services/staffService';
import {
  normalizeTask,
  toBackendStatus,
  type CreateTaskRequest,
  type UpdateTaskRequest,
} from '../../services/taskService';
import { normalizeVital, type CreateVitalRequest } from '../../services/vitalService';

export interface OwnerDashboardTotals {
  facilities: number;
  branches: number;
  residents: number;
}

export interface OwnerDashboardSnapshot {
  facilities: Facility[];
  branches: Branch[];
  residents: Resident[];
  alerts: Alert[];
  totals: OwnerDashboardTotals;
}

export interface FacilityDashboardTotals {
  branches: number;
  residents: number;
  staff: number;
}

export interface FacilityDashboardSnapshot {
  facilityId: string | null;
  branches: Branch[];
  residents: Resident[];
  staff: User[];
  alerts: Alert[];
  totals: FacilityDashboardTotals;
}

export interface BranchDashboardTotals {
  residents: number;
  staff: number;
  tasks: number;
  alerts: number;
}

export interface BranchDashboardSnapshot {
  branchId: string | null;
  residents: Resident[];
  tasks: Task[];
  alerts: Alert[];
  staff: StaffMember[];
  totals: BranchDashboardTotals;
}

export interface StaffDashboardTotals {
  tasks: number;
  residents: number;
  alerts: number;
  pendingTasks: number;
  completedTasks: number;
  activeAlerts: number;
}

export interface StaffDashboardSnapshot {
  staffId: string | null;
  branchId: string | null;
  residents: Resident[];
  tasks: Task[];
  alerts: Alert[];
  totals: StaffDashboardTotals;
}

const getApiBase = (): string => {
  const base = import.meta.env.VITE_API_URL;
  if (!base) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return String(base).replace(/\/$/, '');
};

const getAuthToken = (): string => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) return '';
  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

const asAlertArray = (value: unknown): Alert[] => {
  if (!Array.isArray(value)) return [];
  return (value as AlertPayload[]).map(normalizeAlert);
};

const normalizeAuditLogsResponse = (payload: unknown): AuditLog[] => {
  if (Array.isArray(payload)) return payload as AuditLog[];
  if (payload && typeof payload === 'object') {
    const d = payload as { data?: unknown; logs?: unknown };
    if (Array.isArray(d.data)) return d.data as AuditLog[];
    if (Array.isArray(d.logs)) return d.logs as AuditLog[];
  }
  return [];
};

const extractFacilitiesPayload = (payload: unknown): Facility[] => {
  if (Array.isArray(payload)) return payload as Facility[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: Facility[] }).data;
  }
  if (Array.isArray((payload as { facilities?: unknown })?.facilities)) {
    return (payload as { facilities: Facility[] }).facilities;
  }
  return [];
};

const extractBranchesPayload = (payload: unknown): Branch[] => {
  if (Array.isArray(payload)) return payload as Branch[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: Branch[] }).data;
  }
  if (Array.isArray((payload as { branches?: unknown })?.branches)) {
    return (payload as { branches: Branch[] }).branches;
  }
  return [];
};

const extractStaffPayload = (payload: unknown): User[] => {
  if (Array.isArray(payload)) return payload as User[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: User[] }).data;
  }
  if (Array.isArray((payload as { staff?: unknown })?.staff)) {
    return (payload as { staff: User[] }).staff;
  }
  return [];
};

const extractResidentsPayload = (payload: unknown): Resident[] => {
  if (Array.isArray(payload)) return payload as Resident[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: Resident[] }).data;
  }
  if (Array.isArray((payload as { residents?: unknown })?.residents)) {
    return (payload as { residents: Resident[] }).residents;
  }
  return [];
};

const normalizePaginatedFacilities = (
  payload: unknown,
): PaginatedFacilitiesResponse => {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as PaginatedFacilitiesResponse).data) &&
    typeof (payload as PaginatedFacilitiesResponse).total === 'number'
  ) {
    return payload as PaginatedFacilitiesResponse;
  }
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };
};

const normalizePaginatedBranches = (
  payload: unknown,
): PaginatedBranchesResponse => {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as PaginatedBranchesResponse).data) &&
    typeof (payload as PaginatedBranchesResponse).total === 'number'
  ) {
    return payload as PaginatedBranchesResponse;
  }
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };
};

const normalizePaginatedResidents = (
  payload: unknown,
): PaginatedResidentsResponse => {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as PaginatedResidentsResponse).data) &&
    typeof (payload as PaginatedResidentsResponse).total === 'number'
  ) {
    return payload as PaginatedResidentsResponse;
  }
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };
};

const normalizePaginatedStaff = (payload: unknown): PaginatedStaffResponse => {
  const paginated = extractPaginatedStaffPayload(payload);
  if (paginated) return paginated;
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };
};

const extractTasksPayload = (payload: unknown): Task[] => {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown })?.data)
      ? (payload as { data: unknown[] }).data
      : [];
  return raw.map((item) =>
    normalizeTask(item as Parameters<typeof normalizeTask>[0]),
  );
};

const extractVitalsPayload = (payload: unknown): Vital[] =>
  (Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown })?.data)
      ? (payload as { data: unknown[] }).data
      : Array.isArray((payload as { vitals?: unknown })?.vitals)
        ? (payload as { vitals: unknown[] }).vitals
        : []
  ).map((item) => normalizeVital(item as Partial<Vital>));

const normalizePaginatedAuditLogs = (
  payload: unknown,
): PaginatedAuditLogsResponse => {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as PaginatedAuditLogsResponse).data) &&
    typeof (payload as PaginatedAuditLogsResponse).total === 'number'
  ) {
    return payload as PaginatedAuditLogsResponse;
  }
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    actions: [],
  };
};

const extractPaginatedTotal = (payload: unknown, fallback: number): number => {
  if (
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { total?: unknown }).total === 'number'
  ) {
    return (payload as { total: number }).total;
  }
  return fallback;
};

const extractOwnerDashboardTotals = (
  response: Record<string, unknown>,
  facilities: Facility[],
  branches: Branch[],
  residents: Resident[],
): OwnerDashboardTotals => {
  const fromApi = response.totals;
  if (fromApi && typeof fromApi === 'object') {
    const t = fromApi as Partial<OwnerDashboardTotals>;
    return {
      facilities:
        typeof t.facilities === 'number'
          ? t.facilities
          : extractPaginatedTotal(response.facilities, facilities.length),
      branches:
        typeof t.branches === 'number'
          ? t.branches
          : extractPaginatedTotal(response.branches, branches.length),
      residents:
        typeof t.residents === 'number'
          ? t.residents
          : extractPaginatedTotal(response.residents, residents.length),
    };
  }
  return {
    facilities: extractPaginatedTotal(response.facilities, facilities.length),
    branches: extractPaginatedTotal(response.branches, branches.length),
    residents: extractPaginatedTotal(response.residents, residents.length),
  };
};

export const oronApi = createApi({
  reducerPath: 'oronApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBase(),
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'OwnerDashboard',
    'FacilityDashboard',
    'BranchDashboard',
    'StaffDashboard',
    'Facility',
    'Facilities',
    'Branch',
    'Branches',
    'Resident',
    'Residents',
    'Staff',
    'Tasks',
    'Vitals',
    'User',
    'Rules',
    'AuditLogs',
    'Alerts',
  ],
  endpoints: (builder) => ({
    getOwnerDashboard: builder.query<OwnerDashboardSnapshot, void>({
      query: () => '/dashboards/owner',
      providesTags: () => [{ type: 'OwnerDashboard', id: 'OWNER' }],
      transformResponse: (response: Record<string, unknown>): OwnerDashboardSnapshot => {
        const facilitiesRaw = extractFacilitiesPayload(response?.facilities);
        const branches = extractBranchesPayload(response?.branches);
        const residents = extractResidentsPayload(response?.residents);
        const totals = extractOwnerDashboardTotals(
          response,
          facilitiesRaw,
          branches,
          residents,
        );
        const residentCountsByFacility = residents.reduce(
          (acc, resident) => {
            if (resident.facilityId) {
              acc[resident.facilityId] = (acc[resident.facilityId] ?? 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>,
        );
        const facilities = facilitiesRaw.map((facility) => ({
          ...facility,
          totalResidents:
            residentCountsByFacility[facility.id] ??
            facility.totalResidents ??
            0,
        }));
        const alerts = asAlertArray(response?.alerts)
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { facilities, branches, residents, alerts, totals };
      },
    }),

    getFacilityDashboard: builder.query<FacilityDashboardSnapshot, void>({
      query: () => '/dashboards/facility',
      providesTags: () => [{ type: 'FacilityDashboard', id: 'FACILITY' }],
      transformResponse: (
        response: Record<string, unknown>,
      ): FacilityDashboardSnapshot => {
        const branches = extractBranchesPayload(response?.branches);
        const residents = extractResidentsPayload(response?.residents);
        const staff = extractStaffPayload(response?.staff);
        const alerts = asAlertArray(response?.alerts)
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const totalsRaw = response?.totals;
        const totals: FacilityDashboardTotals =
          totalsRaw && typeof totalsRaw === 'object'
            ? {
                branches:
                  typeof (totalsRaw as FacilityDashboardTotals).branches === 'number'
                    ? (totalsRaw as FacilityDashboardTotals).branches
                    : branches.length,
                residents:
                  typeof (totalsRaw as FacilityDashboardTotals).residents === 'number'
                    ? (totalsRaw as FacilityDashboardTotals).residents
                    : residents.length,
                staff:
                  typeof (totalsRaw as FacilityDashboardTotals).staff === 'number'
                    ? (totalsRaw as FacilityDashboardTotals).staff
                    : staff.length,
              }
            : {
                branches: branches.length,
                residents: residents.length,
                staff: staff.length,
              };
        return {
          facilityId:
            typeof response?.facilityId === 'string' ? response.facilityId : null,
          branches,
          residents,
          staff,
          alerts,
          totals,
        };
      },
    }),

    getStaffDashboard: builder.query<StaffDashboardSnapshot, void>({
      query: () => '/dashboards/staff',
      providesTags: () => [{ type: 'StaffDashboard', id: 'STAFF' }],
      transformResponse: (
        response: Record<string, unknown>,
      ): StaffDashboardSnapshot => {
        const residents = extractResidentsPayload(response?.residents);
        const tasks = extractTasksPayload(response?.tasks);
        const alerts = asAlertArray(response?.alerts)
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const totalsRaw = response?.totals;
        const totals: StaffDashboardTotals =
          totalsRaw && typeof totalsRaw === 'object'
            ? {
                tasks:
                  typeof (totalsRaw as StaffDashboardTotals).tasks === 'number'
                    ? (totalsRaw as StaffDashboardTotals).tasks
                    : tasks.length,
                residents:
                  typeof (totalsRaw as StaffDashboardTotals).residents === 'number'
                    ? (totalsRaw as StaffDashboardTotals).residents
                    : residents.length,
                alerts:
                  typeof (totalsRaw as StaffDashboardTotals).alerts === 'number'
                    ? (totalsRaw as StaffDashboardTotals).alerts
                    : alerts.length,
                pendingTasks:
                  typeof (totalsRaw as StaffDashboardTotals).pendingTasks === 'number'
                    ? (totalsRaw as StaffDashboardTotals).pendingTasks
                    : tasks.filter(
                        (t) => t.status === 'Todo' || t.status === 'In Progress',
                      ).length,
                completedTasks:
                  typeof (totalsRaw as StaffDashboardTotals).completedTasks === 'number'
                    ? (totalsRaw as StaffDashboardTotals).completedTasks
                    : tasks.filter((t) => t.status === 'Done').length,
                activeAlerts:
                  typeof (totalsRaw as StaffDashboardTotals).activeAlerts === 'number'
                    ? (totalsRaw as StaffDashboardTotals).activeAlerts
                    : alerts.filter((a) => a.status !== 'Resolved').length,
              }
            : {
                tasks: tasks.length,
                residents: residents.length,
                alerts: alerts.length,
                pendingTasks: tasks.filter(
                  (t) => t.status === 'Todo' || t.status === 'In Progress',
                ).length,
                completedTasks: tasks.filter((t) => t.status === 'Done').length,
                activeAlerts: alerts.filter((a) => a.status !== 'Resolved').length,
              };
        return {
          staffId:
            typeof response?.staffId === 'string' ? response.staffId : null,
          branchId:
            typeof response?.branchId === 'string' ? response.branchId : null,
          residents,
          tasks,
          alerts,
          totals,
        };
      },
    }),

    getBranchDashboard: builder.query<BranchDashboardSnapshot, void>({
      query: () => '/dashboards/branch',
      providesTags: () => [{ type: 'BranchDashboard', id: 'BRANCH' }],
      transformResponse: (
        response: Record<string, unknown>,
      ): BranchDashboardSnapshot => {
        const residents = extractResidentsPayload(response?.residents);
        const tasks = extractTasksPayload(response?.tasks);
        const alerts = asAlertArray(response?.alerts)
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const staffRaw = extractStaffPayload(response?.staff);
        const staff = staffRaw.map((member) =>
          normalizeStaff(member as Parameters<typeof normalizeStaff>[0]),
        );
        const totalsRaw = response?.totals;
        const totals: BranchDashboardTotals =
          totalsRaw && typeof totalsRaw === 'object'
            ? {
                residents:
                  typeof (totalsRaw as BranchDashboardTotals).residents === 'number'
                    ? (totalsRaw as BranchDashboardTotals).residents
                    : residents.length,
                staff:
                  typeof (totalsRaw as BranchDashboardTotals).staff === 'number'
                    ? (totalsRaw as BranchDashboardTotals).staff
                    : staff.length,
                tasks:
                  typeof (totalsRaw as BranchDashboardTotals).tasks === 'number'
                    ? (totalsRaw as BranchDashboardTotals).tasks
                    : tasks.length,
                alerts:
                  typeof (totalsRaw as BranchDashboardTotals).alerts === 'number'
                    ? (totalsRaw as BranchDashboardTotals).alerts
                    : alerts.length,
              }
            : {
                residents: residents.length,
                staff: staff.length,
                tasks: tasks.length,
                alerts: alerts.length,
              };
        return {
          branchId:
            typeof response?.branchId === 'string' ? response.branchId : null,
          residents,
          tasks,
          alerts,
          staff,
          totals,
        };
      },
    }),

    getFacilities: builder.query<Facility[], void>({
      query: () => '/facilities',
      providesTags: (result) =>
        result
          ? [
              { type: 'Facilities' as const, id: 'LIST' },
              ...result.map((f) => ({ type: 'Facility' as const, id: f.id })),
            ]
          : [{ type: 'Facilities', id: 'LIST' }],
      transformResponse: (response: unknown) => extractFacilitiesPayload(response),
    }),

    getFacilitiesPaginated: builder.query<
      PaginatedFacilitiesResponse,
      FacilitiesQueryParams
    >({
      query: (params) => ({
        url: '/facilities',
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params.status && params.status !== 'All'
            ? { status: params.status }
            : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: 'Facilities' as const, id: 'LIST' },
              ...result.data.map((f) => ({ type: 'Facility' as const, id: f.id })),
            ]
          : [{ type: 'Facilities', id: 'LIST' }],
      transformResponse: (response: unknown) =>
        normalizePaginatedFacilities(response),
    }),

    getFacilityById: builder.query<Facility, string>({
      query: (id) => `/facilities/${id}`,
      providesTags: (_r, _e, id) => [
        { type: 'Facility', id },
        { type: 'Facilities', id: 'LIST' },
      ],
    }),

    getBranches: builder.query<Branch[], void>({
      query: () => '/branches',
      providesTags: (result) =>
        result
          ? [
              { type: 'Branches' as const, id: 'LIST' },
              ...result.map((b) => ({ type: 'Branch' as const, id: b.id })),
            ]
          : [{ type: 'Branches', id: 'LIST' }],
      transformResponse: (response: unknown) => extractBranchesPayload(response),
    }),

    getBranchById: builder.query<Branch, string>({
      query: (id) => `/branches/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Branch', id }],
    }),

    getBranchesPaginated: builder.query<
      PaginatedBranchesResponse,
      BranchesQueryParams
    >({
      query: (params) => ({
        url: '/branches',
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params.status && params.status !== 'All'
            ? { status: params.status }
            : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: 'Branches' as const, id: 'LIST' },
              ...result.data.map((b) => ({ type: 'Branch' as const, id: b.id })),
            ]
          : [{ type: 'Branches', id: 'LIST' }],
      transformResponse: (response: unknown) =>
        normalizePaginatedBranches(response),
    }),

    getResidentsPaginated: builder.query<
      PaginatedResidentsResponse,
      ResidentsQueryParams
    >({
      query: (params) => ({
        url: '/residents',
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params.status && params.status !== 'All'
            ? { status: params.status }
            : {}),
          ...(params.healthState && params.healthState !== 'All'
            ? { healthState: params.healthState }
            : {}),
          ...(params.branchId && params.branchId !== 'All'
            ? { branchId: params.branchId }
            : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: 'Residents' as const, id: 'LIST' },
              ...result.data.map((r) => ({ type: 'Resident' as const, id: r.id })),
            ]
          : [{ type: 'Residents', id: 'LIST' }],
      transformResponse: (response: unknown) =>
        normalizePaginatedResidents(response),
    }),

    getResidentById: builder.query<Resident, string>({
      query: (id) => `/residents/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Resident', id }],
      transformResponse: (response: unknown) => normalizeResident(response),
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    getStaffPaginated: builder.query<PaginatedStaffResponse, StaffQueryParams>({
      query: (params) => ({
        url: '/staff',
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params.branchId && params.branchId !== 'All'
            ? { branchId: params.branchId }
            : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: 'Staff' as const, id: 'LIST' },
              ...result.data.map((s) => ({ type: 'Staff' as const, id: s.id })),
            ]
          : [{ type: 'Staff', id: 'LIST' }],
      transformResponse: (response: unknown) => normalizePaginatedStaff(response),
    }),

    getStaffById: builder.query<StaffMember, string>({
      query: (id) => `/staff/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Staff', id }],
      transformResponse: (response: unknown) =>
        normalizeStaff(extractSingleStaffPayload(response)),
    }),

    getTasks: builder.query<Task[], void>({
      query: () => '/task',
      providesTags: [{ type: 'Tasks', id: 'LIST' }],
      transformResponse: (response: unknown) => extractTasksPayload(response),
    }),

    getVitals: builder.query<Vital[], void>({
      query: () => '/vitals',
      providesTags: [{ type: 'Vitals', id: 'LIST' }],
      transformResponse: (response: unknown) => extractVitalsPayload(response),
    }),

    getVitalsByResident: builder.query<Vital[], string>({
      query: (residentId) => `/vitals/resident/${residentId}`,
      providesTags: (_r, _e, residentId) => [
        { type: 'Vitals', id: `RESIDENT_${residentId}` },
      ],
      transformResponse: (response: unknown) => extractVitalsPayload(response),
    }),

    getRules: builder.query<Rule[], void>({
      query: () => '/rules',
      providesTags: [{ type: 'Rules', id: 'LIST' }],
      transformResponse: (response: unknown) => parseRulesApiResponse(response),
    }),

    getAuditLogs: builder.query<AuditLog[], void>({
      query: () => '/audit-logs',
      providesTags: [{ type: 'AuditLogs', id: 'LIST' }],
      transformResponse: (response: unknown) => normalizeAuditLogsResponse(response),
    }),

    getAuditLogsPaginated: builder.query<
      PaginatedAuditLogsResponse,
      AuditLogsQueryParams
    >({
      query: (params) => ({
        url: '/audit-logs',
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search?.trim() ? { search: params.search.trim() } : {}),
          ...(params.action && params.action !== 'All'
            ? { action: params.action }
            : {}),
          ...(params.period ? { period: params.period } : {}),
        },
      }),
      providesTags: [{ type: 'AuditLogs', id: 'LIST' }],
      transformResponse: (response: unknown) =>
        normalizePaginatedAuditLogs(response),
    }),

    getAlerts: builder.query<Alert[], void>({
      query: () => '/alerts',
      providesTags: [{ type: 'Alerts', id: 'LIST' }],
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return asAlertArray(response);
        const d = response as { data?: unknown; alerts?: unknown };
        if (Array.isArray(d?.data)) return asAlertArray(d.data);
        if (Array.isArray(d?.alerts)) return asAlertArray(d.alerts);
        return [];
      },
    }),

    createFacility: builder.mutation<CreateFacilityResponse, FormData>({
      query: (body) => ({
        url: '/facilities',
        method: 'POST',
        body,
      }),
      invalidatesTags: () => [
        { type: 'Facilities', id: 'LIST' },
        { type: 'OwnerDashboard', id: 'OWNER' },
      ],
    }),

    updateFacility: builder.mutation<
      Facility,
      { id: string; body: UpdateFacilityRequest }
    >({
      query: ({ id, body }) => ({
        url: `/facilities/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Facility', id },
        { type: 'Facilities', id: 'LIST' },
        { type: 'OwnerDashboard', id: 'OWNER' },
        { type: 'Branches', id: 'LIST' },
      ],
    }),

    createResident: builder.mutation<
      Resident,
      { body: CreateResidentRequest; residentPhoto?: File }
    >({
      query: ({ body, residentPhoto }) => ({
        url: '/residents',
        method: 'POST',
        body: buildResidentFormData(body, residentPhoto),
      }),
      invalidatesTags: () => [
        { type: 'Residents', id: 'LIST' },
        { type: 'FacilityDashboard', id: 'FACILITY' },
        { type: 'BranchDashboard', id: 'BRANCH' },
        { type: 'OwnerDashboard', id: 'OWNER' },
      ],
    }),

    updateResident: builder.mutation<
      Resident,
      { id: string; body: CreateResidentRequest; residentPhoto?: File }
    >({
      query: ({ id, body, residentPhoto }) => ({
        url: `/residents/${id}`,
        method: 'PUT',
        body: buildResidentFormData(body, residentPhoto),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Resident', id },
        { type: 'Residents', id: 'LIST' },
        { type: 'FacilityDashboard', id: 'FACILITY' },
        { type: 'BranchDashboard', id: 'BRANCH' },
        { type: 'OwnerDashboard', id: 'OWNER' },
      ],
    }),

    createStaff: builder.mutation<StaffMember, CreateStaffRequest>({
      query: (body) => ({
        url: '/staff',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeStaff(extractSingleStaffPayload(response)),
      invalidatesTags: () => [
        { type: 'Staff', id: 'LIST' },
        { type: 'FacilityDashboard', id: 'FACILITY' },
        { type: 'BranchDashboard', id: 'BRANCH' },
      ],
    }),

    updateStaff: builder.mutation<
      StaffMember,
      { id: string; body: UpdateStaffRequest }
    >({
      query: ({ id, body }) => ({
        url: `/staff/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeStaff(extractSingleStaffPayload(response)),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Staff', id },
        { type: 'Staff', id: 'LIST' },
        { type: 'FacilityDashboard', id: 'FACILITY' },
        { type: 'BranchDashboard', id: 'BRANCH' },
        { type: 'StaffDashboard', id: 'STAFF' },
      ],
    }),

    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (body) => ({
        url: '/task',
        method: 'POST',
        body: { ...body, status: toBackendStatus(body.status) },
      }),
      transformResponse: (response: unknown) =>
        normalizeTask(response as Parameters<typeof normalizeTask>[0]),
      invalidatesTags: () => [
        { type: 'Tasks', id: 'LIST' },
        { type: 'BranchDashboard', id: 'BRANCH' },
      ],
    }),

    updateTask: builder.mutation<
      Task,
      { id: string; body: UpdateTaskRequest }
    >({
      query: ({ id, body }) => ({
        url: `/task/${id}`,
        method: 'PATCH',
        body: {
          ...body,
          ...(body.status ? { status: toBackendStatus(body.status) } : {}),
        },
      }),
      transformResponse: (response: unknown) =>
        normalizeTask(response as Parameters<typeof normalizeTask>[0]),
      invalidatesTags: () => [
        { type: 'Tasks', id: 'LIST' },
        { type: 'BranchDashboard', id: 'BRANCH' },
        { type: 'StaffDashboard', id: 'STAFF' },
      ],
    }),

    createVital: builder.mutation<Vital, CreateVitalRequest>({
      query: (body) => ({
        url: '/vitals',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeVital(response as Partial<Vital>),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Vitals', id: 'LIST' },
        { type: 'Vitals', id: `RESIDENT_${arg.residentId}` },
        { type: 'BranchDashboard', id: 'BRANCH' },
        { type: 'StaffDashboard', id: 'STAFF' },
      ],
    }),

    createBranch: builder.mutation<Branch, CreateBranchRequest>({
      query: (body) => ({
        url: '/branches',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Branches', id: 'LIST' },
        { type: 'Facility', id: arg.facilityId },
        { type: 'OwnerDashboard', id: 'OWNER' },
        { type: 'FacilityDashboard', id: 'FACILITY' },
      ],
    }),

    updateBranch: builder.mutation<
      Branch,
      { id: string; body: UpdateBranchRequest; facilityId: string }
    >({
      query: ({ id, body }) => ({
        url: `/branches/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Branch', id: arg.id },
        { type: 'Branches', id: 'LIST' },
        { type: 'Facility', id: arg.facilityId },
        { type: 'OwnerDashboard', id: 'OWNER' },
        { type: 'FacilityDashboard', id: 'FACILITY' },
      ],
    }),

    updateRule: builder.mutation<Rule, { id: string; body: Partial<Rule> }>({
      query: ({ id, body }) => ({
        url: `/rules/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (payload: unknown) => {
        const raw = (payload as { data?: unknown })?.data ?? payload;
        const list = parseRulesApiResponse(Array.isArray(raw) ? raw : raw != null ? [raw] : []);
        return list[0] as Rule;
      },
      invalidatesTags: () => [{ type: 'Rules', id: 'LIST' }],
    }),

    updateAlertStatus: builder.mutation<
      Alert,
      { id: string; status: Alert['status'] }
    >({
      query: ({ id, status }) => ({
        url: `/alerts/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (payload: unknown) =>
        normalizeAlert(payload as AlertPayload),
      invalidatesTags: () => [
        { type: 'Alerts', id: 'LIST' },
        { type: 'OwnerDashboard', id: 'OWNER' },
        { type: 'FacilityDashboard', id: 'FACILITY' },
        { type: 'BranchDashboard', id: 'BRANCH' },
        { type: 'StaffDashboard', id: 'STAFF' },
      ],
    }),
  }),
});

export const {
  useGetOwnerDashboardQuery,
  useGetFacilityDashboardQuery,
  useGetBranchDashboardQuery,
  useGetStaffDashboardQuery,
  useGetFacilitiesQuery,
  useGetFacilitiesPaginatedQuery,
  useGetFacilityByIdQuery,
  useGetBranchesQuery,
  useGetBranchesPaginatedQuery,
  useGetBranchByIdQuery,
  useGetResidentsPaginatedQuery,
  useGetResidentByIdQuery,
  useGetStaffPaginatedQuery,
  useGetStaffByIdQuery,
  useGetTasksQuery,
  useGetVitalsQuery,
  useGetVitalsByResidentQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useCreateVitalMutation,
  useGetUserByIdQuery,
  useGetRulesQuery,
  useGetAuditLogsQuery,
  useGetAuditLogsPaginatedQuery,
  useLazyGetAuditLogsPaginatedQuery,
  useGetAlertsQuery,
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
  useCreateResidentMutation,
  useUpdateResidentMutation,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useUpdateRuleMutation,
  useUpdateAlertStatusMutation,
} = oronApi;
