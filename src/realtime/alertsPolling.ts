import type { Alert, Role } from '../types';

const alertTargetsRole = (alert: Alert, role: Role | undefined): boolean => {
  if (!role) return false;
  if (!alert.targetRoles?.length) return true;
  return alert.targetRoles.includes(role);
};

export const dispatchAlertCreated = (alert: Alert) => {
  window.dispatchEvent(new CustomEvent('oron:alert:created', { detail: alert }));
};

export const dispatchAlertUpdated = (alert: Alert) => {
  window.dispatchEvent(new CustomEvent('oron:alert:updated', { detail: alert }));
};

export type AlertsPollingState = {
  hydrated: boolean;
  statusById: Map<string, string>;
};

export const createAlertsPollingState = (): AlertsPollingState => ({
  hydrated: false,
  statusById: new Map(),
});

/**
 * Compares successive poll results and emits the same window events as the Socket.IO client.
 */
export const processPollingAlerts = (
  alerts: Alert[],
  role: Role | undefined,
  state: AlertsPollingState,
): void => {
  if (!state.hydrated) {
    for (const alert of alerts) {
      state.statusById.set(alert.id, alert.status);
    }
    state.hydrated = true;
    return;
  }

  for (const alert of alerts) {
    const previousStatus = state.statusById.get(alert.id);

    if (previousStatus === undefined) {
      state.statusById.set(alert.id, alert.status);
      if (alert.status === 'Unread' && alertTargetsRole(alert, role)) {
        dispatchAlertCreated(alert);
      }
      continue;
    }

    if (previousStatus !== alert.status) {
      state.statusById.set(alert.id, alert.status);
      dispatchAlertUpdated(alert);
    }
  }

  const currentIds = new Set(alerts.map((a) => a.id));
  for (const id of state.statusById.keys()) {
    if (!currentIds.has(id)) {
      state.statusById.delete(id);
    }
  }
};
