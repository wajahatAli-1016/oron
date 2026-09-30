import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

export {
  Dropdown,
  type DropdownProps,
  type DropdownOpenOn,
  type DropdownPlacement,
  type DropdownTriggerState,
} from './common/Dropdown';
export {
  FilterDropdown,
  type FilterDropdownOption,
  type FilterDropdownProps,
} from './common/FilterDropdown';
// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isLoading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
  {
    className = '',
    variant = 'primary',
    size = 'md',
    icon: Icon,
    isLoading,
    children,
    ...props
  },
  ref) =>
  {
    const baseStyles =
    'inline-flex items-center justify-center whitespace-nowrap font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
      primary:
      'bg-primary text-white hover:opacity-95 focus:ring-primary',
      secondary:
      'bg-card text-fg hover:opacity-95 focus:ring-primary border border-border',
      outline:
      'border border-border bg-transparent hover:bg-primarySoft text-fg focus:ring-primary',
      ghost:
      'bg-transparent hover:bg-primarySoft text-fg focus:ring-primary',
      danger: 'bg-error text-white hover:opacity-95 focus:ring-error'
    };
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    };
    const hasChildren = React.Children.count(children) > 0;
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}>
        
        {isLoading &&
        <svg
          className={`animate-spin -ml-1 h-4 w-4 text-current ${hasChildren ? 'mr-2' : ''}`}
          fill="none"
          viewBox="0 0 24 24">
          
            <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4" />
          
            <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          
          </svg>
        }
        {!isLoading && Icon &&
        <Icon className={`${hasChildren ? 'mr-2' : ''} ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
        }
        {children}
      </button>);

  }
);
Button.displayName = 'Button';
// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-slate-700 mb-1">
            {label}
          </label>
        }
        <div className="relative">
          {Icon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-slate-400" />
            </div>
          }
          <input
            ref={ref}
            className={`block w-full rounded-lg border ${error ? 'border-error text-fg focus:ring-error focus:border-error' : 'border-border text-fg focus:ring-primary focus:border-primary'} sm:text-sm px-3 py-2 bg-card shadow-sm transition-colors ${Icon ? 'pl-10' : ''} ${className}`}
            {...props} />
          
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>);

  }
);
Input.displayName = 'Input';
// Card
export const Card = ({
  children,
  className = '',
  noPadding = false




}: {children: React.ReactNode;className?: string;noPadding?: boolean;}) =>
<div
  className={`bg-card rounded-xl shadow-card border border-border overflow-hidden ${className}`}>
  
    {!noPadding ? <div className="p-5">{children}</div> : children}
  </div>;

// Badge
export const Badge = ({
  children,
  variant = 'default',
  className = ''




}: {children: React.ReactNode;variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';className?: string;}) => {
  const variants = {
    default: 'bg-primarySoft text-fg border-border',
    success: 'bg-[color-mix(in_srgb,var(--color-success)_16%,transparent)] text-success border-[color-mix(in_srgb,var(--color-success)_35%,transparent)]',
    warning: 'bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-warning border-[color-mix(in_srgb,var(--color-warning)_35%,transparent)]',
    danger: 'bg-[color-mix(in_srgb,var(--color-error)_16%,transparent)] text-error border-[color-mix(in_srgb,var(--color-error)_35%,transparent)]',
    info: 'bg-[color-mix(in_srgb,var(--color-info)_16%,transparent)] text-info border-[color-mix(in_srgb,var(--color-info)_35%,transparent)]'
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      
      {children}
    </span>);

};
// StatsCard
export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp






}: {title: string;value: string | number;icon: LucideIcon;trend?: string;trendUp?: boolean;}) =>
<Card className="flex flex-col">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="p-2 bg-brand-50 rounded-lg">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>
    </div>
    <div className="mt-4 flex items-baseline">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {trend &&
    <p
      className={`ml-2 flex items-baseline text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
      
          {trendUp ? '↑' : '↓'} {trend}
        </p>
    }
    </div>
  </Card>;

// Modal
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  bodyClassName = 'p-5 overflow-y-auto',
  closeOnBackdrop = false,
  closeOnEsc = false,






}: {isOpen: boolean;onClose: () => void;title: string;children: React.ReactNode;maxWidth?: string;bodyClassName?: string;closeOnBackdrop?: boolean;closeOnEsc?: boolean;}) => {
  if (!isOpen) return null;
  React.useEffect(() => {
    if (!closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeOnEsc, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={() => {
        if (closeOnBackdrop) onClose();
      }}>
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 transition-colors">
            
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
              
            </svg>
          </button>
        </div>
        <div className={bodyClassName}>{children}</div>
      </div>
    </div>);

};