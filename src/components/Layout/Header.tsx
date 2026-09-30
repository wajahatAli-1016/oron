import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Bell, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Alert } from "../../types";
import {
  useGetAlertsQuery,
  useUpdateAlertStatusMutation,
} from "../../store/api/oronApi";
type Props = {
  setIsMobileMenuOpen: (value: boolean) => void;
};

const Header = ({ setIsMobileMenuOpen }: Props) => {
  const location = useLocation();
  const [, setBreadcrumbTick] = useState(0);
  const { user } = useAuth();
  const toast = useToast();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const seenAlertIdsRef = useRef<Set<string>>(new Set());
  const hasHydratedAlertsRef = useRef(false);

  const {
    data: alerts = [],
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useGetAlertsQuery(undefined, {
    skip: !user,
    // Polling is driven by useAlertsRealtime in DashboardLayout (Vercel-safe).
    pollingInterval: 0,
  });

  const [updateAlertStatus] = useUpdateAlertStatusMutation();

  const paths = useMemo(
    () => location.pathname.split("/").filter(Boolean),
    [location.pathname],
  );

  useEffect(() => {
    const onBreadcrumbUpdate = () => setBreadcrumbTick((t) => t + 1);
    window.addEventListener("oron:breadcrumb:update", onBreadcrumbUpdate);
    return () => window.removeEventListener("oron:breadcrumb:update", onBreadcrumbUpdate);
  }, []);

  useEffect(() => {
    hasHydratedAlertsRef.current = false;
    seenAlertIdsRef.current = new Set();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user || alertsLoading || hasHydratedAlertsRef.current) return;

    alerts
      .filter((a) => a.status === "Unread")
      .forEach((a) => seenAlertIdsRef.current.add(a.id));
    hasHydratedAlertsRef.current = true;
  }, [user, alerts, alertsLoading]);

  useEffect(() => {
    const onAlertCreated = (event: Event) => {
      const alert = (event as CustomEvent<Alert>).detail;
      if (!alert || alert.status !== "Unread") return;
      if (
        user?.role &&
        alert.targetRoles?.length &&
        !alert.targetRoles.includes(user.role)
      ) {
        return;
      }
      if (seenAlertIdsRef.current.has(alert.id)) return;

      seenAlertIdsRef.current.add(alert.id);
      const short =
        alert.message.length > 120
          ? `${alert.message.slice(0, 117)}...`
          : alert.message;
      toast.info(`${alert.title} — ${short}`);
    };

    window.addEventListener("oron:alert:created", onAlertCreated);
    return () => window.removeEventListener("oron:alert:created", onAlertCreated);
  }, [toast, user?.role]);

  const isUuidLike = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

  const PATH_SEGMENT_LABELS: Record<string, string> = {
    owner: "Platform Owner",
    "facility-admin": "Facility Admin",
    admin: "Branch Admin",
    staff: "Staff",
  };

  const formatPathSegment = (segment: string) => {
    if (PATH_SEGMENT_LABELS[segment]) return PATH_SEGMENT_LABELS[segment];
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCrumbLabel = (path: string, index: number) => {
    if (!isUuidLike(path)) return formatPathSegment(path);

    const parent = paths[index - 1];
    const cached = sessionStorage.getItem(`breadcrumb:${parent}:${path}`);
    if (cached) {
      return cached;
    }

    if (parent === 'residents') return 'Resident';
    if (parent === 'staff') return 'Staff';
    if (parent === 'branches') return 'Branch';
    if (parent === 'facilities') return 'Facility';
    return 'Details';
  };

  const roleHome = useMemo(() => {
    return paths[0] ? `/${paths[0]}` : (user?.role === "facility_admin" ? "/facility-admin" : user?.role === "admin" ? "/admin" : user?.role === "staff" ? "/staff" : "/owner");
  }, [paths, user?.role]);

  const sortedAlerts = useMemo(
    () => [...alerts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [alerts],
  );

  const unreadCount = useMemo(
    () => sortedAlerts.filter((a) => a.status === "Unread").length,
    [sortedAlerts],
  );

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsNotificationsOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isNotificationsOpen]);

  const markAsRead = async (id: string) => {
    try {
      await updateAlertStatus({ id, status: "Read" }).unwrap();
    } catch {
      void refetchAlerts();
    }
  };

  const markAllAsRead = async () => {
    const unread = sortedAlerts.filter((a) => a.status === "Unread");
    if (unread.length === 0) return;
    try {
      await Promise.all(
        unread.map((a) => updateAlertStatus({ id: a.id, status: "Read" }).unwrap()),
      );
    } catch {
      void refetchAlerts();
    }
  };

  const badgeText = unreadCount > 99 ? "99+" : `${unreadCount}`;
  const previewAlerts = useMemo(
    () => sortedAlerts.filter((a) => a.status === "Unread").slice(0, 5),
    [sortedAlerts],
  );

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-slate-500"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden sm:flex items-center text-sm">
          {paths.map((path, index) => {
            const currentPath =
              "/" + paths.slice(0, index + 1).join("/");

            const isLast = index === paths.length - 1;

            return (
              <Fragment key={currentPath}>
                {isLast ? (
                  <span className="font-semibold text-slate-900">
                    {getCrumbLabel(path, index)}
                  </span>
                ) : (
                  <Link to={currentPath} className="text-slate-500">
                    {getCrumbLabel(path, index)}
                  </Link>
                )}

                {!isLast && (
                  <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full"
          aria-label="Notifications"
          onClick={() => setIsNotificationsOpen((v) => !v)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold leading-[18px] text-center">
              {badgeText}
            </span>
          )}
        </button>

        {isNotificationsOpen && (
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="text-sm font-semibold text-slate-900">Notifications</div>
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-[360px] overflow-auto divide-y divide-slate-100">
              {previewAlerts.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  No unread notifications.
                </div>
              ) : (
                previewAlerts.map((a) => (
                  <Link
                    key={a.id}
                    to={`${roleHome}/notifications?id=${encodeURIComponent(a.id)}`}
                    className={`block px-4 py-3 hover:bg-slate-50 transition-colors ${
                      a.status === "Unread" ? "bg-brand-50/30" : ""
                    }`}
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      void markAsRead(a.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                          a.severity === "Critical"
                            ? "bg-red-600"
                            : a.severity === "Warning"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {a.title}
                          </div>
                          <div className="text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(a.date).toLocaleString([], { month: "short", day: "numeric" })}
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 truncate">{a.message}</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <Link
                to={`${roleHome}/notifications`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
                onClick={() => setIsNotificationsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
