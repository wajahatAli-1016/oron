// NotificationsSkeleton.tsx
import React from 'react';
import { Bell, ShieldAlert, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '../UI';

const NotificationSkeletonItem = () => {
  return (
    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 transition-colors">
      {/* Icon Circle Skeleton */}
      <div className="shrink-0 h-10 w-10 rounded-full bg-slate-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        
        {/* Message Skeleton */}
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
        </div>
        
        {/* Badges Skeleton */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Mark Read Button Skeleton */}
      <div className="shrink-0 flex items-start justify-end sm:w-24">
        <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
};

export const NotificationsSkeleton = () => {
  const tabs = ['All', 'Unread', 'Critical', 'Warning', 'Info'];
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded mt-1 animate-pulse" />
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Card Skeleton */}
      <Card noPadding>
        {/* Tabs Navigation Skeleton */}
        <div className="border-b border-slate-200 px-2">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab, index) => (
              <div
                key={tab}
                className="py-4 px-4 whitespace-nowrap"
              >
                <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </nav>
        </div>

        {/* Notifications List Skeleton */}
        <div className="divide-y divide-slate-100">
          {/* Show 5 skeleton items */}
          {[...Array(5)].map((_, index) => (
            <div key={index}>
              <NotificationSkeletonItem />
              {index < 4 && <div className="border-t border-slate-100" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Alternative: Compact version for dropdown/popover notifications
export const CompactNotificationsSkeleton = () => {
  return (
    <div className="space-y-3 min-w-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Notification Items */}
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-3 flex gap-3">
            <div className="shrink-0 h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200">
        <div className="h-8 w-full bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
};