import { io, type Socket } from 'socket.io-client';
import { isAlertsPollingMode } from '../config/realtime';
import { normalizeAlert, type AlertPayload } from '../services/alertsService';
import type { Alert, Role } from '../types';
import { oronApi } from '../store/api/oronApi';
import { store } from '../store/store';

let socket: Socket | null = null;
let subscriberCount = 0;

const getAuthToken = (): string => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) return '';
  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

/** HTTP(S) API origin used for Socket.IO (namespace `/alerts`). */
export const getAlertsSocketBaseUrl = (): string => {
  const explicit = import.meta.env.VITE_WS_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const apiUrl = import.meta.env.VITE_API_URL;
  return apiUrl ? apiUrl.replace(/\/$/, '') : '';
};

const getCurrentUserRole = (): Role | null => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) return null;
  try {
    return (JSON.parse(auth) as { user?: { role?: Role } }).user?.role ?? null;
  } catch {
    return null;
  }
};

const alertTargetsRole = (alert: Alert, role: Role | null): boolean => {
  if (!role) return false;
  if (!alert.targetRoles?.length) return true;
  return alert.targetRoles.includes(role);
};

const mergeAlertIntoCache = (alert: Alert) => {
  store.dispatch(
    oronApi.util.updateQueryData('getAlerts', undefined, (draft) => {
      const index = draft.findIndex((item) => item.id === alert.id);
      if (index >= 0) {
        draft[index] = alert;
        return;
      }
      draft.unshift(alert);
    }),
  );
};

const invalidateAlertQueries = () => {
  store.dispatch(oronApi.util.invalidateTags([{ type: 'Alerts', id: 'LIST' }]));
  store.dispatch(
    oronApi.util.invalidateTags([
      { type: 'OwnerDashboard', id: 'OWNER' },
      { type: 'FacilityDashboard', id: 'FACILITY' },
      { type: 'BranchDashboard', id: 'BRANCH' },
      { type: 'StaffDashboard', id: 'STAFF' },
    ]),
  );
};

const dispatchAlertEvent = (name: 'oron:alert:created' | 'oron:alert:updated', alert: Alert) => {
  window.dispatchEvent(new CustomEvent(name, { detail: alert }));
};

const handleRealtimeAlert = (
  alert: Alert,
  eventName: 'oron:alert:created' | 'oron:alert:updated',
) => {
  const role = getCurrentUserRole();
  if (!alertTargetsRole(alert, role)) {
    return;
  }

  mergeAlertIntoCache(alert);
  invalidateAlertQueries();
  dispatchAlertEvent(eventName, alert);
};

/**
 * Maintains a single Socket.IO connection while any dashboard subscriber is mounted.
 */
export const connectAlertsSocket = (): (() => void) => {
  subscriberCount += 1;

  if (isAlertsPollingMode()) {
    return () => {
      subscriberCount = Math.max(0, subscriberCount - 1);
    };
  }

  const baseUrl = getAlertsSocketBaseUrl();
  const token = getAuthToken();

  if (!socket && baseUrl && token) {
    socket = io(`${baseUrl}/alerts`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on('alert:created', (payload: AlertPayload) => {
      handleRealtimeAlert(normalizeAlert(payload), 'oron:alert:created');
    });

    socket.on('alert:updated', (payload: AlertPayload) => {
      handleRealtimeAlert(normalizeAlert(payload), 'oron:alert:updated');
    });

    socket.on('connect', () => {
      window.dispatchEvent(new Event('oron:alerts:socket:connect'));
    });

    socket.on('disconnect', () => {
      window.dispatchEvent(new Event('oron:alerts:socket:disconnect'));
    });

    socket.on('connect_error', () => {
      window.dispatchEvent(new Event('oron:alerts:socket:disconnect'));
    });
  } else if (socket && token) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }

  return () => {
    subscriberCount = Math.max(0, subscriberCount - 1);
    if (subscriberCount === 0 && socket) {
      socket.disconnect();
      socket = null;
    }
  };
};

export const isAlertsSocketConnected = (): boolean => Boolean(socket?.connected);
