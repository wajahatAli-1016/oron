// TaskManagementsSkeleton.tsx
import { Plus, Calendar, User, Filter, Eye, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SkeletonCard = () => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      {/* Task Header Skeleton */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
        </div>
        <div className="h-6 w-6 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
      </div>

      {/* Task Details Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate-300" />
          <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          <div className="h-3 bg-slate-200 rounded w-24 animate-pulse" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
        </div>
        <div className="flex gap-1">
          <div className="h-6 w-6 bg-slate-200 rounded animate-pulse" />
          <div className="h-6 w-6 bg-slate-200 rounded animate-pulse" />
          <div className="h-6 w-6 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const ColumnSkeleton = ({ title }: { title: string }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Column Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-5 w-8 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export const TaskManagementsSkeleton = () => {
  const columns = ['Todo', 'In Progress', 'Done'];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* HEADER SKELETON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded mt-1 animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Select Skeleton */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Filter className="h-4 w-4 text-slate-300" />
            <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
          </div>

          {/* Create Task Button Skeleton */}
          <div className="h-9 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* TASK BOARD SKELETON */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex flex-col md:flex-row gap-6 md:h-full md:min-w-[1000px]">
          {columns.map((column) => (
            <motion.div
              key={column}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <ColumnSkeleton title={column} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};