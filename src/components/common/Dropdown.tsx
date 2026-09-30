import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

export type DropdownOpenOn = 'click' | 'hover' | 'both';
export type DropdownPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end';

export type DropdownTriggerState = {
  open: boolean;
  toggle: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

export type DropdownProps = {
  /** Button, chip, etc. — or a render function for full control */
  trigger:
    | React.ReactNode
    | ((state: DropdownTriggerState) => React.ReactNode);
  /** Panel content shown when open */
  children: React.ReactNode;
  /** How the menu opens (default: click) */
  openOn?: DropdownOpenOn;
  /** Controlled open state */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: DropdownPlacement;
  disabled?: boolean;
  /** Ms before hover opens (hover / both) */
  hoverOpenDelay?: number;
  /** Ms before hover closes — allows moving into the panel */
  hoverCloseDelay?: number;
  closeOnClickInside?: boolean;
  className?: string;
  panelClassName?: string;
  /** Min width of panel; use "trigger" to match trigger width */
  panelMinWidth?: string;
  id?: string;
};

const PLACEMENT_CLASSES: Record<DropdownPlacement, string> = {
  'bottom-start': 'left-0 top-full mt-1.5 origin-top-left',
  'bottom-end': 'right-0 top-full mt-1.5 origin-top-right',
  'top-start': 'left-0 bottom-full mb-1.5 origin-bottom-left',
  'top-end': 'right-0 bottom-full mb-1.5 origin-bottom-right',
};

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export const Dropdown = ({
  trigger,
  children,
  openOn = 'click',
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-end',
  disabled = false,
  hoverOpenDelay = 80,
  hoverCloseDelay = 150,
  closeOnClickInside = false,
  className,
  panelClassName,
  panelMinWidth,
  id: idProp,
}: DropdownProps) => {
  const autoId = useId();
  const panelId = idProp ?? `dropdown-panel-${autoId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<number | undefined>(undefined);
  const closeTimerRef = useRef<number | undefined>(undefined);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [visible, setVisible] = useState(defaultOpen);

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [disabled, isControlled, onOpenChange],
  );

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const openMenu = useCallback(() => {
    clearTimers();
    setOpen(true);
  }, [clearTimers, setOpen]);

  const closeMenu = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen]);

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const scheduleOpen = useCallback(() => {
    if (disabled) return;
    clearTimers();
    openTimerRef.current = setTimeout(() => openMenu(), hoverOpenDelay);
  }, [clearTimers, disabled, hoverOpenDelay, openMenu]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => closeMenu(), hoverCloseDelay);
  }, [clearTimers, closeMenu, hoverCloseDelay]);

  useEffect(() => {
    if (open) {
      setVisible(true);
      return;
    }
    const t = setTimeout(() => setVisible(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target || !rootRef.current?.contains(target)) {
        closeMenu();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, closeMenu]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const supportsHover = openOn === 'hover' || openOn === 'both';
  const supportsClick = openOn === 'click' || openOn === 'both';

  const handleRootMouseEnter = () => {
    if (supportsHover) scheduleOpen();
  };

  const handleRootMouseLeave = () => {
    if (supportsHover) scheduleClose();
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (!supportsClick) return;
    e.stopPropagation();
    toggle();
  };

  const triggerState: DropdownTriggerState = {
    open,
    toggle,
    openMenu,
    closeMenu,
  };

  const attachTriggerHandlers = (
    el: React.ReactElement<{
      onClick?: React.MouseEventHandler;
      onMouseDown?: React.MouseEventHandler;
      onMouseEnter?: React.MouseEventHandler;
      onMouseLeave?: React.MouseEventHandler;
      'aria-expanded'?: boolean;
      'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
      'aria-controls'?: string;
      disabled?: boolean;
    }>,
  ) =>
    React.cloneElement(el, {
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      'aria-controls': panelId,
      disabled: disabled || el.props.disabled,
      onMouseDown: (e: React.MouseEvent) => {
        el.props.onMouseDown?.(e);
        if (supportsClick) e.preventDefault();
      },
      onClick: (e: React.MouseEvent) => {
        el.props.onClick?.(e);
        handleTriggerClick(e);
      },
      onMouseEnter: (e: React.MouseEvent) => {
        el.props.onMouseEnter?.(e);
        if (supportsHover) scheduleOpen();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        el.props.onMouseLeave?.(e);
        if (supportsHover) scheduleClose();
      },
    });

  const renderTrigger = () => {
    if (typeof trigger === 'function') {
      const node = trigger(triggerState);
      if (React.isValidElement(node)) {
        return attachTriggerHandlers(
          node as React.ReactElement<{
            onClick?: React.MouseEventHandler;
            onMouseDown?: React.MouseEventHandler;
            onMouseEnter?: React.MouseEventHandler;
            onMouseLeave?: React.MouseEventHandler;
            'aria-expanded'?: boolean;
            'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
            'aria-controls'?: string;
            disabled?: boolean;
          }>,
        );
      }
      return node;
    }

    if (React.isValidElement(trigger)) {
      const el = trigger as React.ReactElement<{
        onClick?: React.MouseEventHandler;
        onMouseEnter?: React.MouseEventHandler;
        onMouseLeave?: React.MouseEventHandler;
        'aria-expanded'?: boolean;
        'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
        'aria-controls'?: string;
        disabled?: boolean;
      }>;

      return attachTriggerHandlers(el);
    }

    return (
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={panelId}
        onClick={handleTriggerClick}
        className="inline-flex items-center"
      >
        {trigger}
      </button>
    );
  };

  const panelStyle: React.CSSProperties | undefined =
    panelMinWidth === 'trigger'
      ? { minWidth: 'var(--dropdown-trigger-width)' }
      : panelMinWidth
        ? { minWidth: panelMinWidth }
        : undefined;

  return (
    <div
      ref={rootRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleRootMouseEnter}
      onMouseLeave={handleRootMouseLeave}
      style={
        panelMinWidth === 'trigger'
          ? ({
              ['--dropdown-trigger-width' as string]: '100%',
            } as React.CSSProperties)
          : undefined
      }
    >
      {renderTrigger()}

      {visible ? (
        <div
          id={panelId}
          role="menu"
          aria-hidden={!open}
          style={panelStyle}
          className={cn(
            'absolute z-[100] rounded-xl border border-slate-200 bg-white shadow-lg',
            'transition-[opacity,transform] duration-200 ease-out',
            open
              ? 'pointer-events-auto opacity-100 scale-100'
              : 'pointer-events-none opacity-0 scale-[0.98]',
            PLACEMENT_CLASSES[placement],
            panelClassName,
          )}
          onClick={
            closeOnClickInside
              ? () => closeMenu()
              : (e) => e.stopPropagation()
          }
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};
