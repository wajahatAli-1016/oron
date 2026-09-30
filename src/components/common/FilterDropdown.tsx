import type { LucideIcon } from 'lucide-react';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { Dropdown, type DropdownPlacement } from './Dropdown';

export type FilterDropdownOption = {
  value: string;
  label: string;
  count?: number;
};

export type FilterDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterDropdownOption[];
  ariaLabel: string;
  icon?: LucideIcon;
  minWidth?: string;
  placement?: DropdownPlacement;
  showCountInTrigger?: boolean;
  showCountsInMenu?: boolean;
  className?: string;
};

export const FilterDropdown = ({
  value,
  onChange,
  options,
  ariaLabel,
  icon: Icon = Filter,
  minWidth = '10.5rem',
  placement = 'bottom-end',
  showCountInTrigger = false,
  showCountsInMenu = true,
  className,
}: FilterDropdownProps) => {
  const selected = options.find((o) => o.value === value) ?? options[0];

  const triggerText =
    showCountInTrigger && selected.count !== undefined
      ? `${selected.label} (${selected.count})`
      : selected.label;

  return (
    <Dropdown
      openOn="click"
      placement={placement}
      panelMinWidth="trigger"
      closeOnClickInside
      className={className}
      trigger={({ open }) => (
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ minWidth }}
          aria-label={ariaLabel}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">{triggerText}</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}
    >
      <div className="max-h-64 overflow-y-auto py-1 scrollbar-hide" role="none">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? 'bg-primarySoft font-medium text-primary'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => onChange(option.value)}
            >
              <span className="min-w-0 truncate">
                {option.label}
                {showCountsInMenu && option.count !== undefined ? (
                  <span className="ml-1.5 tabular-nums text-slate-400">
                    ({option.count})
                  </span>
                ) : null}
              </span>
              {isSelected ? (
                <Check className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <span className="h-4 w-4 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </Dropdown>
  );
};
