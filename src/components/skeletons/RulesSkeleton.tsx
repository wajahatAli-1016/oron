// RulesEnginesSkeleton.tsx
import { motion } from 'framer-motion';
import { Card, Button } from '../../components/UI';
import { Settings, Info, Activity } from 'lucide-react';

const ThresholdGaugeSkeleton = () => {
  return (
    <div className="mt-6 mb-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1 px-1">
        <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full w-1/5 bg-slate-200 animate-pulse" />
      </div>
      <div className="flex justify-between text-[10px] font-medium text-slate-500 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-2 w-12 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-2 w-12 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-2 w-10 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const RuleCardSkeleton = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="h-full transition-all duration-200 border-slate-200">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-300" />
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="relative inline-flex h-5 w-9 rounded-full bg-slate-200 animate-pulse" />
        </div>

        {/* Description */}
        <div className="space-y-1 mb-4">
          <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Threshold Gauge */}
        <ThresholdGaugeSkeleton />

        {/* Edit Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
        </div>
      </Card>
    </motion.div>
  );
};

const EditingRuleCardSkeleton = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="h-full transition-all duration-200 border-brand-200 shadow-sm">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-300" />
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="relative inline-flex h-5 w-9 rounded-full bg-brand-500 animate-pulse" />
        </div>

        {/* Description */}
        <div className="space-y-1 mb-4">
          <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* Edit Form Section */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
          
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="space-y-1">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const RulesEnginesSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded mt-1 animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Info Card Skeleton */}
      <Card className="bg-slate-50 border-slate-100">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </Card>

      {/* Permission Warning Skeleton (if applicable - shown for non-owners) */}
      {/* Uncomment if you want to show this conditionally */}
      {/* 
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="h-4 w-96 bg-amber-200 rounded animate-pulse" />
      </div>
      */}

      {/* Rules Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Show 4 rule cards (2 columns x 2 rows) */}
        <RuleCardSkeleton delay={0} />
        <RuleCardSkeleton delay={0.05} />
        <RuleCardSkeleton delay={0.1} />
        <RuleCardSkeleton delay={0.15} />
      </div>
    </div>
  );
};

// Alternative: Skeleton for when a rule is being saved/updated
export const RulesEnginesSavingSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header with reduced opacity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-50">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded mt-1 animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Info Card with reduced opacity */}
      <Card className="bg-slate-50 border-slate-100 opacity-50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </Card>

      {/* Rules Grid with overlay effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-50">
          <RuleCardSkeleton delay={0} />
          <RuleCardSkeleton delay={0.05} />
          <RuleCardSkeleton delay={0.1} />
          <RuleCardSkeleton delay={0.15} />
        </div>
      </div>
    </div>
  );
};

// Alternative: Skeleton with editing mode active for one card
export const RulesEnginesEditingSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded mt-1 animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Info Card */}
      <Card className="bg-slate-50 border-slate-100">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </Card>

      {/* Rules Grid - First card in editing mode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EditingRuleCardSkeleton delay={0} />
        <RuleCardSkeleton delay={0.05} />
        <RuleCardSkeleton delay={0.1} />
        <RuleCardSkeleton delay={0.15} />
      </div>
    </div>
  );
};