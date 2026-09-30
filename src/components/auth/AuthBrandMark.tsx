import React from 'react';

/**
 * Centered logo + wordmark for the login screen left panel (gradient background applied by parent).
 */
export const AuthLoginBrandPanel = () => (
  <div className="relative z-10 flex flex-col items-center text-center px-4">
    <div
      className="flex h-28 w-28 items-center justify-center rounded-[1.35rem] bg-white shadow-2xl ring-2 ring-white/25 sm:h-32 sm:w-32"
    >
      <img
        src="/oron-logo.svg"
        alt="Oron Health"
        className="h-[4.5rem] w-[4.5rem] object-contain sm:h-[5rem] sm:w-[5rem]"
        width={80}
        height={80}
      />
    </div>

    <div className="mt-10 max-w-sm">
      <p className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
        ORON
        <span className="font-bold text-emerald-200"> Health</span>
      </p>
      <p className="mt-5 text-base font-medium leading-snug text-white/85 sm:text-lg">
        SeniorCare platform — care management and operational intelligence
      </p>
    </div>
  </div>
);
