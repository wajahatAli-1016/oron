import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Download, Calendar } from 'lucide-react';
import { Card, Button, Input, FilterDropdown } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import SmartTable from '../../shared/Table';
import { Aditlogscolumns } from '../../shared/TableColumns';
import {
  useGetAuditLogsPaginatedQuery,
  useLazyGetAuditLogsPaginatedQuery,
} from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import type { AuditLogPeriod } from '../../services/auditLogService';
import TableSkeleton from '../skeletons/TableSkeleton';
import { Pagination } from '../Pagination';
import { RefreshButton } from '../refresh/Refresh';

const PAGE_SIZE = 10;

export const AuditLog = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const errorToastShown = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState<AuditLogPeriod>('7');
  const [page, setPage] = useState(1);

  const handleSearch = () => {
    setAppliedSearch(searchTerm.trim());
    setPage(1);
  };

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAuditLogsPaginatedQuery(
    {
      page,
      limit: PAGE_SIZE,
      search: appliedSearch,
      action: actionFilter,
      period: periodFilter,
    },
    { skip: !isAuthenticated || !user },
  );

  const [fetchAuditLogsForExport] = useLazyGetAuditLogsPaginatedQuery();

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const availableActions = data?.actions ?? [];
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
  const loading = isLoading || isFetching;
  const errorMessage = isError
    ? getApiErrorMessage(error, 'Failed to load audit logs')
    : null;

  useEffect(() => {
    if (!isError) {
      errorToastShown.current = false;
      return;
    }
    if (errorToastShown.current) return;
    errorToastShown.current = true;
    toast.error(getApiErrorMessage(error, 'Failed to load audit logs'));
  }, [isError, error, toast]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const showingFrom = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, total);

  const handleExportCSV = useCallback(async () => {
    try {
      const result = await fetchAuditLogsForExport({
        page: 1,
        limit: Math.min(total || PAGE_SIZE, 500),
        search: appliedSearch,
        action: actionFilter,
      }).unwrap();
      const exportLogs = result.data;
      const headers = ['Timestamp', 'User', 'Action', 'Details'];
      const csvContent = [
        headers.join(','),
        ...exportLogs.map(
          (log) =>
            `"${new Date(log.timestamp).toISOString()}","${log.user}","${log.action}","${log.details.replace(/"/g, '""')}"`,
        ),
      ].join('\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit_logs.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to export audit logs'));
    }
  }, [actionFilter, appliedSearch, fetchAuditLogsForExport, periodFilter, toast, total]);

  const actionOptions = useMemo(
    () =>
      ['All', ...availableActions].map((action) => ({
        value: action,
        label: action,
      })),
    [availableActions],
  );

  const periodOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ">
        <div className='min-w-0 shrink'>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all system activity and user actions for your branch.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <Button variant="outline" icon={Download} onClick={() => void handleExportCSV()}>
            Export CSV
          </Button>
          <RefreshButton onRefresh={() => void refetch()} isLoading={loading} />
        </div>
      </div>

      <Card noPadding className="overflow-visible">
        <div className="relative z-20 overflow-visible p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="w-full sm:w-80">
            <div className="relative">
              <input
                type="search"
                placeholder="Search by name or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="block w-full rounded-lg border border-border bg-card py-2 pl-3 pr-10 text-sm text-fg shadow-sm transition-colors focus:outline-none"
                aria-label="Search residents"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:text-brand-600 focus:outline-none"
                aria-label="Search residents"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <FilterDropdown
              value={periodFilter}
              onChange={(next) => {
                setPeriodFilter(next as AuditLogPeriod);
                setPage(1);
              }}
              options={periodOptions}
              ariaLabel="Filter by date range"
              icon={Calendar}
              minWidth="9.5rem"
              showCountsInMenu={false}
            />
            <FilterDropdown
              value={actionFilter}
              onChange={(next) => {
                setActionFilter(next);
                setPage(1);
              }}
              options={actionOptions}
              ariaLabel="Filter by action"
              minWidth="8.5rem"
              showCountsInMenu={false}
            />
          </div>
        </div>
        {errorMessage && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg m-4">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <TableSkeleton
            rows={PAGE_SIZE}
            columns={Aditlogscolumns.map((column) => column.label)}
          />
        ) : total === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-400 mb-2">
              <Search className="h-12 w-12 mx-auto" />
            </div>

            <p className="text-lg font-medium text-slate-900">
              No audit logs found
            </p>

            <p className="text-sm mt-1 text-slate-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <SmartTable
            data={logs}
            columns={Aditlogscolumns}
          />
        )}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">{showingFrom}</span> to{' '}
            <span className="font-medium text-slate-900">{showingTo}</span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">{total}</span>{' '}
            results
          </p>
          <Pagination
            page={safePage}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
};
