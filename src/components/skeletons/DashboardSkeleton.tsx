// src/components/skeletons/AdminDashboardSkeleton.tsx
import React from 'react';
import { Card } from '../../components/UI';

export const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Section */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 shrink">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-100 mt-2" />
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <div className="h-10 w-32 shrink-0 rounded-lg bg-slate-200" />
          <div className="h-10 w-36 shrink-0 rounded-lg bg-slate-200" />
          <div className="h-10 w-24 shrink-0 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Key Metrics Cards - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-8 w-12 rounded bg-slate-200" />
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-100" />
            </div>
            {index === 3 && (
              <div className="mt-2">
                <div className="h-3 w-32 rounded bg-slate-100" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Tasks Card Skeleton */}
        <Card className="flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="h-4 w-20 rounded bg-slate-200" />
          </div>
          <div className="p-5 space-y-3 flex-1">
            {/* 4 Task Items */}
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="h-5 w-32 rounded bg-slate-200" />
                    <div className="h-4 w-16 rounded bg-slate-100" />
                  </div>
                  <div className="h-5 w-16 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-full rounded bg-slate-100 mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3.5 w-3.5 rounded-full bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3.5 w-3.5 rounded-full bg-slate-200" />
                    <div className="h-3 w-20 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Alerts Card Skeleton */}
        <Card className="flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="h-5 w-12 rounded bg-slate-200" />
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {/* 3 Alert Items */}
            {[...Array(3)].map((_, index) => (
              <div key={index} className="p-5 flex gap-4">
                <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-4 w-48 rounded bg-slate-200" />
                    <div className="h-3 w-16 rounded bg-slate-100" />
                  </div>
                  <div className="h-4 w-full rounded bg-slate-100 mt-2" />
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-6 w-24 rounded bg-slate-100" />
                    <div className="h-6 w-20 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};