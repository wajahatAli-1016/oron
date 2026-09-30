// components/shared/Notifications.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bell,
  ShieldAlert,
  Check,
  CheckCircle2,
  Info,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { Card, Button, Badge } from '../UI';
import { mockBranches } from '../../mockData';
import { useGetAlertsQuery, useUpdateAlertStatusMutation } from '../../store/api/oronApi';
import { tryParseVitalsAlert } from '../../utils/vitalsAlertMessage';
import { NotificationsSkeleton } from '../skeletons/NotificationSkeleton';
import { RefreshButton } from '../refresh/Refresh';

const HIGHLIGHT_DURATION_MS = 2000;

export const Notifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAlertId = searchParams.get('id');
  const [highlightedAlertId, setHighlightedAlertId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const {
    data: alerts = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAlertsQuery();
  const [updateAlertStatus] = useUpdateAlertStatusMutation();

  const loadError = isError ? 'Failed to load notifications' : null;

  const tabs = ['All', 'Unread', 'Critical', 'Warning', 'Info'];

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return alert.status === 'Unread';
    return alert.severity === activeTab;
  });

  useEffect(() => {
    if (urlAlertId) {
      setHighlightedAlertId(urlAlertId);
    }
  }, [urlAlertId]);

  useEffect(() => {
    if (!urlAlertId || alerts.length === 0) return;

    const selected = alerts.find((a) => a.id === urlAlertId);
    if (!selected) return;

    const visibleInTab =
      activeTab === 'All' ||
      (activeTab === 'Unread' && selected.status === 'Unread') ||
      selected.severity === activeTab;

    if (!visibleInTab) {
      setActiveTab('All');
    }
  }, [urlAlertId, alerts, activeTab]);

  useEffect(() => {
    if (!highlightedAlertId || isLoading) return;
    if (!filteredAlerts.some((a) => a.id === highlightedAlertId)) return;

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(`notification-${highlightedAlertId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    const clearHighlightTimer = window.setTimeout(() => {
      setHighlightedAlertId(null);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('id');
          return next;
        },
        { replace: true },
      );
    }, HIGHLIGHT_DURATION_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(clearHighlightTimer);
    };
  }, [highlightedAlertId, isLoading, filteredAlerts, setSearchParams]);

  const markAsRead = async (alertId: string) => {
    try {
      await updateAlertStatus({ id: alertId, status: 'Read' }).unwrap();
    } catch {
      // Keep list unchanged if update fails.
    }
  };

  const markAllAsRead = async () => {
    const unread = alerts.filter((a) => a.status === 'Unread');
    if (unread.length === 0) {
      return;
    }
    try {
      await Promise.all(unread.map((a) => updateAlertStatus({ id: a.id, status: 'Read' }).unwrap()));
    } catch {
      // Keep list unchanged if update fails.
    }
  };

  const getIcon = (severity: string, title: string) => {
    if (title.startsWith('Contract expiring soon')) {
      return <Building2 className="h-5 w-5 text-slate-700" />;
    }
    switch (severity) {
      case 'Critical':
        return <ShieldAlert className="h-5 w-5 text-red-600" />;
      case 'Warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (severity: string, title: string) => {
    if (title.startsWith('Contract expiring soon')) {
      return severity === 'Critical' ? 'bg-red-100' : 'bg-amber-100';
    }
    switch (severity) {
      case 'Critical':
        return 'bg-red-100';
      case 'Warning':
        return 'bg-amber-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getHealthStateColor = (state?: string) => {
    if (!state) return '';
    switch (state) {
      case 'Stable':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Slight Deviation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Concerning Trend':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Early Deterioration':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Active Deterioration':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Recovery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return null;
    const branch = mockBranches.find((b) => b.id === branchId);
    return branch?.name;
  };

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            System alerts and updates relevant to you.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <Button variant="outline" icon={CheckCircle2} onClick={() => void markAllAsRead()}>
            Mark All as Read
          </Button>
          <RefreshButton onRefresh={() => void refetch()} isLoading={isFetching} />
        </div>
      </div>

      <Card noPadding>
        <div className="border-b border-slate-200 px-2">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab}
                {tab === 'Unread' && alerts.filter((a) => a.status === 'Unread').length > 0 && (
                  <span className="ml-2 bg-brand-100 text-brand-700 py-0.5 px-2 rounded-full text-xs">
                    {alerts.filter((a) => a.status === 'Unread').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="divide-y divide-slate-100">
          {!isLoading && loadError && (
            <div className="p-6 text-sm text-red-600">{loadError}</div>
          )}
          {!isLoading &&
            !loadError &&
            filteredAlerts.map((alert) => {
              const branchName = getBranchName(alert.branchId);
              const isSelected = highlightedAlertId === alert.id;
              const vitalsParsed = tryParseVitalsAlert(alert);
              return (
                <div
                  key={alert.id}
                  id={`notification-${alert.id}`}
                  className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 transition-colors duration-500 scroll-mt-24 ${
                    isSelected
                      ? 'mx-2 my-1 rounded-xl border-2 border-brand-500 bg-brand-50'
                      : alert.status === 'Unread'
                        ? 'bg-brand-50/30'
                        : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getBgColor(
                      alert.severity,
                      alert.title,
                    )}`}
                  >
                    {getIcon(alert.severity, alert.title)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3
                        className={`text-base font-semibold ${
                          alert.status === 'Unread' ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {vitalsParsed ? vitalsParsed.displayTitle : alert.title}
                      </h3>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(alert.date).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {vitalsParsed ? (
                      <div
                        className={`text-sm space-y-1.5 ${
                          alert.status === 'Unread' ? 'text-slate-700' : 'text-slate-600'
                        }`}
                      >
                        <ul className="list-none space-y-1 pl-0">
                          {vitalsParsed.bullets.map((line, i) => (
                            <li key={`${alert.id}-vital-${i}`} className="flex gap-2">
                              <span className="text-slate-400 shrink-0" aria-hidden>
                                •
                              </span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p
                        className={`text-sm ${
                          alert.status === 'Unread' ? 'text-slate-700' : 'text-slate-500'
                        }`}
                      >
                        {alert.message}
                      </p>
                    )}
                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                      <Badge
                        variant={
                          alert.severity === 'Critical'
                            ? 'danger'
                            : alert.severity === 'Warning'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {alert.severity}
                      </Badge>
                      {branchName && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                          {branchName}
                        </span>
                      )}
                      {alert.healthState && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getHealthStateColor(
                            alert.healthState,
                          )}`}
                        >
                          {alert.healthState}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-start justify-end sm:w-24">
                    {alert.status === 'Unread' && (
                      <button
                        onClick={() => {
                          void markAsRead(alert.id);
                        }}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1 hover:bg-brand-50 rounded transition-colors"
                      >
                        <Check className="h-3 w-3" /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          {!isLoading && !loadError && filteredAlerts.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Bell className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-900">No notifications</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
