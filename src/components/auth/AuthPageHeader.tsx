import React from 'react';

export type AuthPageHeaderProps = {
  title: string;
  description?: React.ReactNode;
};

/**
 * Prominent title block for secondary auth flows (forgot password, OTP, set password).
 */
export const AuthPageHeader = ({ title, description }: AuthPageHeaderProps) => (
  <header className="mb-10 text-center sm:mx-auto sm:max-w-xl">
    <div className="mb-6 flex justify-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-white shadow-lg ring-1 ring-slate-200">
        <img
          src="/oron-logo.svg"
          alt="Oron Care"
          className="h-20 w-20 object-contain rounded-[0.7rem]"
          width={48}
          height={48}
        />
      </div>
    </div>
    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
    {description != null && <div className="mt-4 text-base leading-relaxed text-slate-600">{description}</div>}
  </header>
);
