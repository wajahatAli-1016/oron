// OwnerReportSkeleton.tsx
import { Card } from '../../components/UI';

export const OwnerReportSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Section - Empty but maintains spacing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded mt-1 animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Charts Grid - 4 gray cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="h-[400px] bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
};