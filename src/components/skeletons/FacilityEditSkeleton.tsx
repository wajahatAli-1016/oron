import { Building2, FileText, User, CheckCircle } from 'lucide-react';
import { Card } from '../../components/UI';

export const FacilityOnboardingSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse mt-2"></div>
      </div>

      {/* Step Indicator Skeleton */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Main Card Skeleton */}
      <Card className="overflow-hidden">
        <div className="p-6 min-h-[400px]">
          {/* Title Skeleton */}
          <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
          
          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            {/* Facility Name Field */}
            <div>
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Facility Type and Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
            
            {/* Email Field */}
            <div>
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
          <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </Card>
    </div>
  );
};

// Alternative: Step-specific skeletons for more granular loading states
export const FacilityOnboardingStepSkeleton = ({ step }: { step: number }) => {
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
            <div>
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div>
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="mt-6">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-32 w-full bg-slate-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="h-7 w-56 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
            <div className="h-4 w-96 bg-slate-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div>
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-24 w-full bg-amber-50 rounded-lg animate-pulse mt-6"></div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse mb-6"></div>
            <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-3 w-20 bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-3 w-28 bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="h-3 w-40 bg-slate-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse mt-2"></div>
      </div>

      {/* Step Indicator Skeleton */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className={`h-10 w-10 rounded-full bg-slate-200 animate-pulse ${s === step ? 'ring-2 ring-brand-200' : ''}`}></div>
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Main Card Skeleton */}
      <Card className="overflow-hidden">
        <div className="p-6 min-h-[400px]">
          {renderStepContent()}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
          <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </Card>
    </div>
  );
};