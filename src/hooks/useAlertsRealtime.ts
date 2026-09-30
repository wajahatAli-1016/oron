import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAlertsPollingInterval, isAlertsPollingMode } from '../config/realtime';
import { connectAlertsSocket } from '../realtime/alertsSocket';
import {
  createAlertsPollingState,
  processPollingAlerts,
} from '../realtime/alertsPolling';
import { useGetAlertsQuery } from '../store/api/oronApi';

/**
 * Live alerts while the dashboard is mounted.
 * - Local / dedicated API host: Socket.IO
 * - Vercel (serverless API): HTTP polling (same REST endpoint)
 */
export const useAlertsRealtime = () => {
  const { user } = useAuth();
  const pollingMode = isAlertsPollingMode();
  const pollInterval = getAlertsPollingInterval();
  const pollingStateRef = useRef(createAlertsPollingState());

  const { data: alerts = [] } = useGetAlertsQuery(undefined, {
    skip: !user,
    pollingInterval: user && pollingMode ? pollInterval : 0,
  });

  useEffect(() => {
    pollingStateRef.current = createAlertsPollingState();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!pollingMode || !user) return;
    processPollingAlerts(alerts, user.role, pollingStateRef.current);
  }, [alerts, pollingMode, user, user?.role]);

  useEffect(() => {
    if (!user || pollingMode) return;
    return connectAlertsSocket();
  }, [user?.id, user?.role, pollingMode, user]);
};
