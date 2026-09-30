import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Building2, Printer } from 'lucide-react';
import { Card, Button, FilterDropdown } from '../../components/UI';
import { Alert, Branch, Facility, Resident } from '../../types';
import { useGetOwnerDashboardQuery } from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Label,
} from 'recharts';
import { OwnerReportSkeleton } from '../skeletons/ReportsSkeleton';
import { RefreshButton } from '../refresh/Refresh';

type FacilityStatus = Facility['status'];

const CONTRACT_STATUS_CONFIG: Record<
  FacilityStatus,
  { label: string; color: string; badgeClass: string }
> = {
  Active: {
    label: 'Active',
    color: '#0D9488',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  Pending: {
    label: 'Pending',
    color: '#F59E0B',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  Suspended: {
    label: 'Suspended',
    color: '#64748B',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  Inactive: {
    label: 'Inactive',
    color: '#EF4444',
    badgeClass: 'bg-red-50 text-red-800 border-red-200',
  },
};

const CONTRACT_STATUS_ORDER: FacilityStatus[] = [
  'Active',
  'Pending',
  'Inactive',
  'Suspended',
];

const FACILITY_FILTER_ALL = 'all';

const formatContractDate = (value: string) => {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

type ContractChartSegment = {
  name: string;
  status: FacilityStatus;
  value: number;
  fill: string;
  facilities: Facility[];
};

const ContractDonutChart = memo(function ContractDonutChart({
  data,
  totalFacilities,
  onHover,
}: {
  data: ContractChartSegment[];
  totalFacilities: number;
  onHover: (status: FacilityStatus) => void;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="58%"
          outerRadius="80%"
          paddingAngle={data.length > 1 ? 3 : 0}
          dataKey="value"
          stroke="#fff"
          strokeWidth={2}
          isAnimationActive={false}
          onMouseEnter={(_, index) => {
            const segment = data[index];
            if (segment) onHover(segment.status);
          }}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                return null;
              }
              const { cx, cy } = viewBox;
              return (
                <text x={cx} y={cy} textAnchor="middle">
                  <tspan x={cx} y={cy} fill="#0f172a" fontSize={24} fontWeight={700}>
                    {totalFacilities}
                  </tspan>
                  <tspan
                    x={cx}
                    y={(cy ?? 0) + 20}
                    fill="#64748b"
                    fontSize={12}
                  >
                    Facilities
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
});

const FacilityContractCard = ({
  facility,
  status,
}: {
  facility: Facility;
  status: FacilityStatus;
}) => {
  const badgeClass = CONTRACT_STATUS_CONFIG[status].badgeClass;
  return (
    <div className={`rounded-md border px-2 py-1 ${badgeClass}`}>
      <p className="truncate text-xs font-semibold leading-tight">{facility.name}</p>
      <p className="truncate text-[10px] leading-tight opacity-80">{facility.type}</p>
      <p className="mt-0.5 text-[9px] leading-tight opacity-75">
        {status === 'Active'
          ? `Through ${formatContractDate(facility.contractEnd)}`
          : `Ends ${formatContractDate(facility.contractEnd)}`}
      </p>
    </div>
  );
};

export const OwnerReport = () => {
  const toast = useToast();
  const errorToastShown = useRef(false);

  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetOwnerDashboardQuery();

  useEffect(() => {
    if (!isError) {
      errorToastShown.current = false;
      return;
    }
    if (errorToastShown.current) return;
    errorToastShown.current = true;
    toast.error(getApiErrorMessage(error, 'Failed to load report data'));
  }, [isError, error, toast]);

  const facilities: Facility[] = data?.facilities ?? [];
  const branches: Branch[] = data?.branches ?? [];
  const residents: Resident[] = data?.residents ?? [];
  const alerts: Alert[] = data?.alerts ?? [];

  const monthLabel = (d: Date) =>
    d.toLocaleString('en-US', { month: 'short' });

  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

  const addMonths = (d: Date, months: number) =>
    new Date(d.getFullYear(), d.getMonth() + months, 1);

  const getResidentGrowthData = (items: Resident[]) => {
    const now = new Date();
    const windowStart = startOfMonth(addMonths(now, -5));
    const buckets = new Map<number, number>();

    for (let i = 0; i < 6; i += 1) {
      const m = addMonths(windowStart, i);
      buckets.set(m.getTime(), 0);
    }

    const admitted = items
      .map((r) => {
        const raw = r.admissionDate;
        const dt = raw ? new Date(raw) : null;
        if (!dt || Number.isNaN(dt.getTime())) return null;
        return startOfMonth(dt);
      })
      .filter(Boolean) as Date[];

    for (const dt of admitted) {
      const key = dt.getTime();
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
    }

    let running = 0;
    const series = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ts, count]) => {
        running += count;
        return { month: monthLabel(new Date(ts)), residents: running };
      });

    const baseline = items.filter((r) => {
      const dt = r.admissionDate ? new Date(r.admissionDate) : null;
      if (!dt || Number.isNaN(dt.getTime())) return false;
      return dt < windowStart;
    }).length;

    if (baseline > 0) {
      let baseRunning = baseline;
      return series.map((p) => {
        baseRunning = baseline + p.residents;
        return { ...p, residents: baseRunning };
      });
    }

    return series;
  };

  const [facilityFilterId, setFacilityFilterId] = useState(FACILITY_FILTER_ALL);

  const branchFacilityFilterOptions = useMemo(
    () => [
      {
        value: FACILITY_FILTER_ALL,
        label: 'All Facilities',
        count: branches.length,
      },
      ...facilities.map((facility) => ({
        value: facility.id,
        label: facility.name,
        count: branches.filter((b) => b.facilityId === facility.id).length,
      })),
    ],
    [branches, facilities],
  );

  const residentFacilityFilterOptions = useMemo(
    () => [
      {
        value: FACILITY_FILTER_ALL,
        label: 'All Facilities',
        count: residents.length,
      },
      ...facilities.map((facility) => ({
        value: facility.id,
        label: facility.name,
        count: residents.filter((r) => r.facilityId === facility.id).length,
      })),
    ],
    [residents, facilities],
  );

  const branchesForUtilization = useMemo(() => {
    if (facilityFilterId === FACILITY_FILTER_ALL) return branches;
    return branches.filter((b) => b.facilityId === facilityFilterId);
  }, [branches, facilityFilterId]);

  const residentsForGrowth = useMemo(() => {
    if (facilityFilterId === FACILITY_FILTER_ALL) return residents;
    return residents.filter((r) => r.facilityId === facilityFilterId);
  }, [residents, facilityFilterId]);

  const utilizationData = useMemo(
    () =>
      branchesForUtilization.map((b) => ({
        name: (b.name || '').split(' ')[0] || b.id,
        utilization: b.residentLimit
          ? Math.round((b.currentResidents / b.residentLimit) * 100)
          : 0,
        limit: b.residentLimit,
      })),
    [branchesForUtilization],
  );

  const growthData = useMemo(
    () => getResidentGrowthData(residentsForGrowth),
    [residentsForGrowth],
  );

  useEffect(() => {
    if (facilityFilterId === FACILITY_FILTER_ALL) return;
    if (!facilities.some((f) => f.id === facilityFilterId)) {
      setFacilityFilterId(FACILITY_FILTER_ALL);
    }
  }, [facilities, facilityFilterId]);

  const [hoveredStatus, setHoveredStatus] = useState<FacilityStatus | null>(
    null,
  );

  const totalFacilities = facilities.length;

  const contractChartData = useMemo((): ContractChartSegment[] => {
    return CONTRACT_STATUS_ORDER
      .map((status) => {
        const grouped = facilities.filter((f) => f.status === status);
        return {
          name: CONTRACT_STATUS_CONFIG[status].label,
          status,
          value: grouped.length,
          fill: CONTRACT_STATUS_CONFIG[status].color,
          facilities: grouped,
        };
      })
      .filter((segment) => segment.value > 0);
  }, [facilities]);

  const statusPercent = (count: number) =>
    totalFacilities ? Math.round((count / totalFacilities) * 100) : 0;

  const hoveredSegment = useMemo(
    () =>
      hoveredStatus
        ? contractChartData.find((s) => s.status === hoveredStatus) ?? null
        : null,
    [contractChartData, hoveredStatus],
  );

  const handleContractHover = useCallback((status: FacilityStatus | null) => {
    setHoveredStatus(status);
  }, []);

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status !== 'Resolved'),
    [alerts],
  );
  const criticalCount = activeAlerts.filter((a) => a.severity === 'Critical').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'Warning').length;
  const infoCount = activeAlerts.filter((a) => a.severity === 'Info').length;
  const alertData = [
  {
    name: 'Critical',
    count: criticalCount,
    fill: '#EF4444'
  },
  {
    name: 'Warning',
    count: warningCount,
    fill: '#F59E0B'
  },
  {
    name: 'Info',
    count: infoCount,
    fill: '#3B82F6'
  }];

  if (loading) {
    return <OwnerReportSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Reports</h1>
            <p className="text-sm text-slate-500 mt-1">System-wide analytics and trends</p>
          </div>
        </div>
        <Card>
          <div className="text-sm text-red-600">Error loading report: {getApiErrorMessage(error, 'Failed to load report data')}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className='min-w-0 shrink'>
          <h1 className="text-2xl font-bold text-slate-900">
            Platform Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System-wide analytics and trends
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        <Button variant="outline" icon={Printer} onClick={() => window.print()}>
          Print Report
        </Button>
        <RefreshButton onRefresh={() => void refetch()} isLoading={isFetching} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Branch Utilization (%)
            </h2>
            {facilities.length > 0 ? (
              <FilterDropdown
                value={facilityFilterId}
                onChange={setFacilityFilterId}
                options={branchFacilityFilterOptions}
                ariaLabel="Filter branch utilization by facility"
                icon={Building2}
                minWidth="11rem"
                showCountsInMenu
                placement="bottom-end"
                className="w-full sm:w-auto"
              />
            ) : null}
          </div>
          <div className="h-72">
            {utilizationData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                <Building2 className="h-10 w-10 text-slate-300" />
                <p className="text-sm">
                  {facilityFilterId === FACILITY_FILTER_ALL
                    ? 'No branches on record yet'
                    : 'No branches for this facility'}
                </p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={utilizationData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0" />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }}
                  domain={[0, 100]} />

                <Tooltip
                  cursor={{
                    fill: '#F8FAFC'
                  }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />

                <Bar
                  dataKey="utilization"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                  barSize={40} />

              </BarChart>
            </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Total Resident Growth (6 Mo)
            </h2>
            {facilities.length > 0 ? (
              <FilterDropdown
                value={facilityFilterId}
                onChange={setFacilityFilterId}
                options={residentFacilityFilterOptions}
                ariaLabel="Filter resident growth by facility"
                icon={Building2}
                minWidth="11rem"
                showCountsInMenu
                placement="bottom-end"
                className="w-full sm:w-auto"
              />
            ) : null}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={growthData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0" />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />

                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />

                <Line
                  type="monotone"
                  dataKey="residents"
                  stroke="#0D9488"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#0D9488',
                    strokeWidth: 2,
                    stroke: '#fff'
                  }}
                  activeDot={{
                    r: 6
                  }} />

              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Facility Contract Status
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Hover the chart or a status row to preview facilities
              </p>
            </div>
            <p className="text-sm font-medium text-slate-700">
              {totalFacilities} total facilit
              {totalFacilities === 1 ? 'y' : 'ies'}
            </p>
          </div>

          {totalFacilities === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-2 text-slate-500">
              <Building2 className="h-10 w-10 text-slate-300" />
              <p className="text-sm">No facilities on record yet</p>
            </div>
          ) : (
            <div
              className="space-y-4"
              onMouseLeave={() => handleContractHover(null)}
            >
              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_10.5rem]">
                <div className="h-[220px] w-full shrink-0">
                  <ContractDonutChart
                    data={contractChartData}
                    totalFacilities={totalFacilities}
                    onHover={handleContractHover}
                  />
                </div>

                <div className="space-y-1.5" role="list" aria-label="Contract status breakdown">
                  {CONTRACT_STATUS_ORDER.map((status) => {
                    const segment = contractChartData.find(
                      (s) => s.status === status,
                    );
                    const count = segment?.value ?? 0;
                    const config = CONTRACT_STATUS_CONFIG[status];
                    const isHighlighted = hoveredStatus === status;

                    return (
                      <div
                        key={status}
                        role="listitem"
                        className={`flex items-center justify-between rounded-lg px-2.5 py-2 transition-colors duration-150 ${
                          isHighlighted && count > 0
                            ? 'bg-slate-100'
                            : count > 0
                              ? 'hover:bg-slate-50'
                              : 'opacity-40'
                        }`}
                        onMouseEnter={() => {
                          if (count > 0) handleContractHover(status);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="text-sm font-medium text-slate-800">
                            {config.label}
                          </span>
                        </span>
                        <span className="text-sm tabular-nums text-slate-600">
                          {count}
                          {count > 0 ? ` (${statusPercent(count)}%)` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="h-[120px] overflow-hidden rounded-lg border border-slate-100 bg-slate-50/90">
                <div className="flex h-full flex-col p-2">
                  <p className="mb-1.5 shrink-0 text-[11px] font-medium text-slate-600">
                    {hoveredSegment ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: hoveredSegment.fill }}
                        />
                        {CONTRACT_STATUS_CONFIG[hoveredSegment.status].label}
                        <span className="text-slate-400">·</span>
                        {hoveredSegment.value} facilit
                        {hoveredSegment.value === 1 ? 'y' : 'ies'}
                        <span className="text-slate-400">·</span>
                        {statusPercent(hoveredSegment.value)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Hover the chart or a status to view facility details
                      </span>
                    )}
                  </p>
                  <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {hoveredSegment ? (
                      <div
                        key={hoveredSegment.status}
                        className="grid grid-cols-1 gap-1.5 sm:grid-cols-2"
                      >
                        {hoveredSegment.facilities.map((facility) => (
                          <FacilityContractCard
                            key={facility.id}
                            facility={facility}
                            status={hoveredSegment.status}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Active Alerts by Severity
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alertData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  bottom: 5,
                  left: 20
                }}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#E2E8F0" />

                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />

                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />

                <Tooltip
                  cursor={{
                    fill: '#F8FAFC'
                  }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />

                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                  {alertData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>);

};
