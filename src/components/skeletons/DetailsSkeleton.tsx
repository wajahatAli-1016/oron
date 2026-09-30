// ResidentDetailsSkeleton.tsx
import React from 'react';
import { Card, Button, Badge } from '../../components/UI';

// Reusable skeleton components
const SkeletonText = ({ width = "w-full", height = "h-4", className = "" }: { width?: string; height?: string; className?: string }) => (
  <div className={`${width} ${height} bg-slate-200 rounded animate-pulse ${className}`}></div>
);

const SkeletonAvatar = ({ size = "h-14 w-14" }: { size?: string }) => (
  <div className={`${size} bg-slate-200 rounded-full animate-pulse`}></div>
);

const SkeletonBadge = ({ width = "w-20" }: { width?: string }) => (
  <div className={`${width} h-6 bg-slate-200 rounded-full animate-pulse`}></div>
);

const SkeletonCard = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const SkeletonButton = ({ width = "w-24", height = "h-9" }: { width?: string; height?: string }) => (
  <div className={`${width} ${height} bg-slate-200 rounded-lg animate-pulse`}></div>
);

// Header Skeleton
const HeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
    <div className="p-2 -ml-2">
      <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
    </div>
    <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
      <SkeletonAvatar />
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <SkeletonText width="w-48" height="h-8" />
          <SkeletonBadge width="w-24" />
          <SkeletonBadge width="w-28" />
        </div>
        <div className="mt-2 flex justify-center md:justify-start">
          <SkeletonText width="w-64" height="h-4" />
        </div>
      </div>
    </div>
    <div>
      <SkeletonButton width="w-32" />
    </div>
  </div>
);

// Tabs Skeleton
const TabsSkeleton = () => (
  <div className="border-b w-full border-slate-200 overflow-x-auto scrollbar-hide">
    <div className="w-[400px] md:w-full">
      <div className="flex gap-6 w-full">
        {['Overview', 'Vitals History', 'Care Plan', 'Medications', 'Tasks', 'Notes'].map((tab, idx) => (
          <div key={idx} className="flex items-center gap-2 py-4 px-1">
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonText width="w-24" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Overview Tab Skeleton
const OverviewTabSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column */}
    <div className="lg:col-span-2 space-y-6">
      {/* Personal Information Card */}
      <SkeletonCard>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonText width="w-40" height="h-6" />
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <SkeletonText width="w-24" height="h-3" />
                <div className="mt-1">
                  <SkeletonText width="w-32" height="h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SkeletonCard>

      {/* Medical Summary Card */}
      <SkeletonCard>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonText width="w-32" height="h-6" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <SkeletonText width="w-28" height="h-3" />
                <div className="mt-1">
                  <SkeletonText width="w-full" height="h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SkeletonCard>

      {/* Emergency Contacts Card */}
      <SkeletonCard>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonText width="w-36" height="h-6" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex justify-between items-center">
                  <div>
                    <SkeletonText width="w-32" height="h-5" />
                    <div className="mt-1">
                      <SkeletonText width="w-24" height="h-3" />
                    </div>
                  </div>
                  <SkeletonText width="w-28" height="h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SkeletonCard>
    </div>

    {/* Right Column */}
    <div className="space-y-6">
      {/* Latest Vitals Card */}
      <SkeletonCard className="bg-brand-50 border-brand-100">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-4 bg-brand-200 rounded animate-pulse"></div>
            <SkeletonText width="w-24" height="h-5" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <SkeletonText width="w-20" height="h-3" />
                <SkeletonText width="w-16" height="h-4" />
              </div>
            ))}
            <div className="pt-3 border-t border-brand-200/50">
              <SkeletonText width="w-28" height="h-2" />
            </div>
          </div>
        </div>
      </SkeletonCard>
    </div>
  </div>
);

// Vitals Tab Skeleton
const VitalsTabSkeleton = () => (
  <div className="space-y-6">
    {/* Chart Card */}
    <SkeletonCard>
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <SkeletonText width="w-32" height="h-6" />
          <SkeletonText width="w-32" height="h-8" />
        </div>
        <div className="h-72 bg-slate-100 rounded animate-pulse"></div>
      </div>
    </SkeletonCard>

    {/* Vitals Log Card */}
    <SkeletonCard>
      <div className="p-5 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <SkeletonText width="w-28" height="h-6" />
          <SkeletonButton width="w-24" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="w-[400px] md:w-full">
          <table className="text-sm text-left w-full">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                {['Date & Time', 'BP', 'HR', 'Temp', 'SpO2', 'Recorded By'].map((header, idx) => (
                  <th key={idx} className="px-5 py-3">
                    <SkeletonText width="w-20" height="h-3" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="px-5 py-4">
                      <SkeletonText width="w-24" height="h-4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SkeletonCard>
  </div>
);

// Care Plan Tab Skeleton
const CarePlanTabSkeleton = () => (
  <div className="space-y-6">
    <SkeletonCard>
      <div className="p-5">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 bg-slate-200 rounded animate-pulse"></div>
            <SkeletonText width="w-32" height="h-6" />
          </div>
          <SkeletonText width="w-96" height="h-4" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
              <div>
                <SkeletonText width="w-24" height="h-3" />
                <div className="mt-1">
                  <SkeletonText width="w-32" height="h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <SkeletonText width="w-36" height="h-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg">
                <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-brand-500"></div>
                <SkeletonText width="w-3/4" height="h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonCard>
  </div>
);

// Medications Tab Skeleton
const MedicationsTabSkeleton = () => (
  <SkeletonCard>
    <div className="p-5 border-b border-slate-100">
      <div className="flex justify-between items-center">
        <SkeletonText width="w-36" height="h-6" />
        <SkeletonButton width="w-32" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
          <tr>
            {['Medication', 'Dosage', 'Schedule', 'Status'].map((header, idx) => (
              <th key={idx} className="px-5 py-3">
                <SkeletonText width="w-24" height="h-3" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[1, 2, 3].map((i) => (
            <tr key={i} className="hover:bg-slate-50/50">
              {[1, 2, 3, 4].map((j) => (
                <td key={j} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {j === 1 && <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>}
                    <SkeletonText width={j === 1 ? "w-32" : "w-24"} height="h-4" />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SkeletonCard>
);

// Tasks Tab Skeleton
const TasksTabSkeleton = () => (
  <SkeletonCard>
    <div className="p-5 border-b border-slate-100">
      <div className="flex justify-between items-center">
        <SkeletonText width="w-32" height="h-6" />
        <SkeletonButton width="w-24" />
      </div>
    </div>
    <div className="p-5 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg border border-slate-200 bg-white">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <SkeletonText width="w-40" height="h-5" />
              <SkeletonBadge width="w-16" />
            </div>
            <SkeletonBadge width="w-20" />
          </div>
          <SkeletonText width="w-full" height="h-4" className="mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 bg-slate-200 rounded animate-pulse"></div>
              <SkeletonText width="w-24" height="h-3" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 bg-slate-200 rounded animate-pulse"></div>
              <SkeletonText width="w-32" height="h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </SkeletonCard>
);

// Notes Tab Skeleton
const NotesTabSkeleton = () => (
  <div className="space-y-6">
    {/* Add Note Card */}
    <SkeletonCard>
      <div className="p-5">
        <SkeletonText width="w-24" height="h-6" className="mb-3" />
        <div className="flex gap-2 mb-3">
          {[1, 2, 3].map((i) => (
            <SkeletonText key={i} width="w-20" height="h-6" />
          ))}
        </div>
        <div className="mb-3">
          <div className="w-full h-24 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-end">
          <SkeletonButton width="w-24" />
        </div>
      </div>
    </SkeletonCard>

    {/* Notes List */}
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} className="hover:border-slate-300 transition-colors">
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse"></div>
                <SkeletonText width="w-32" height="h-4" />
                <SkeletonText width="w-20" height="h-3" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonText width="w-32" height="h-3" />
                <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="pl-8">
              <SkeletonText width="w-full" height="h-4" />
              <SkeletonText width="w-3/4" height="h-4" className="mt-1" />
            </div>
          </div>
        </SkeletonCard>
      ))}
    </div>
  </div>
);

// Main Skeleton Component
export const ResidentDetailsSkeleton = ({ activeTab = 'overview' }: { activeTab?: string }) => {
  const renderTabSkeleton = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTabSkeleton />;
      case 'vitals':
        return <VitalsTabSkeleton />;
      case 'careplan':
        return <CarePlanTabSkeleton />;
      case 'medications':
        return <MedicationsTabSkeleton />;
      case 'tasks':
        return <TasksTabSkeleton />;
      case 'notes':
        return <NotesTabSkeleton />;
      default:
        return <OverviewTabSkeleton />;
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <HeaderSkeleton />
      <TabsSkeleton />
      <div className="min-h-[400px]">
        {renderTabSkeleton()}
      </div>
    </div>
  );
};

// Export individual skeleton components for granular usage
export {
  SkeletonText,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonCard,
  SkeletonButton,
  HeaderSkeleton,
  TabsSkeleton,
  OverviewTabSkeleton,
  VitalsTabSkeleton,
  CarePlanTabSkeleton,
  MedicationsTabSkeleton,
  TasksTabSkeleton,
  NotesTabSkeleton,
};