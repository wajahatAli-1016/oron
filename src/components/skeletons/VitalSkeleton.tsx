// VitalsEntrySkeleton.tsx
import { motion } from "framer-motion";
import { Card } from "../UI";
import { HeartPulse, Activity, User } from "lucide-react";

const FormFieldSkeleton = ({ label }: { label: string }) => {
  return (
    <div className="space-y-1">
      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      <div className="relative">
        <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

const RecentVitalItemSkeleton = () => {
  return (
    <div className="p-4 text-sm">
      <div className="flex justify-between mb-2">
        <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="h-3 w-6 bg-slate-200 rounded animate-pulse mb-1" />
          <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
        </div>
        <div>
          <div className="h-3 w-6 bg-slate-200 rounded animate-pulse mb-1" />
          <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
        </div>
        <div>
          <div className="h-3 w-8 bg-slate-200 rounded animate-pulse mb-1" />
          <div className="h-4 w-10 bg-slate-200 rounded animate-pulse" />
        </div>
        <div>
          <div className="h-3 w-8 bg-slate-200 rounded animate-pulse mb-1" />
          <div className="h-4 w-10 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const VitalsEntrySkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 rounded mt-1 animate-pulse" />
      </div>

      {/* Resident Selector Card */}
      <Card>
        <div className="space-y-1">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </Card>

      {/* Main Content - Form and Sidebar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {/* Form Header */}
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="h-5 w-5 text-slate-300" />
              <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormFieldSkeleton label="Blood Pressure" />
              <FormFieldSkeleton label="Heart Rate" />
              <FormFieldSkeleton label="Temperature" />
              <FormFieldSkeleton label="Oxygen Saturation" />
              <FormFieldSkeleton label="Blood Sugar" />
              <FormFieldSkeleton label="Weight" />
              <FormFieldSkeleton label="Respiratory Rate" />
            </div>

            {/* Notes Field */}
            <div className="space-y-1 mt-6">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-24 w-full bg-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
              <div className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-slate-200 rounded-lg animate-pulse" />
            </div>
          </Card>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6">
          {/* Resident Info Card */}
          <Card className="bg-slate-50 border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
              <div>
                <div className="h-5 w-28 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <div className="h-3 w-28 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="space-y-1">
                <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-4/6 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </Card>

          {/* Recent Entries Card */}
          <Card noPadding>
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-300" />
              <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="divide-y divide-slate-100">
              {/* Show 3 skeleton items */}
              <RecentVitalItemSkeleton />
              <RecentVitalItemSkeleton />
              <RecentVitalItemSkeleton />
            </div>
            {/* Footer Link */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mx-auto" />
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

// Alternative: Loading state for residents only (before resident selection)
export const VitalsEntryInitialSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 rounded mt-1 animate-pulse" />
      </div>

      {/* Resident Selector Loading */}
      <Card>
        <div className="space-y-1">
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </Card>

      {/* Skeleton content before resident selection */}
      <div className="text-center py-12">
        <div className="h-32 w-32 bg-slate-100 rounded-full mx-auto mb-4 animate-pulse" />
        <div className="h-4 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
      </div>
    </div>
  );
};