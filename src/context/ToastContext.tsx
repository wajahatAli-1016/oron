import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => removeToast(id), type === 'info' ? 6000 : 4000);
    },
    [removeToast],
  );

  const value = useMemo<ToastContextType>(
    () => ({
      success: (message: string) => pushToast('success', message),
      error: (message: string) => pushToast('error', message),
      info: (message: string) => pushToast('info', message),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[1000] space-y-2 w-[min(92vw,420px)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            ) : (
              <img
                src="/oron-logo.svg"
                alt="Oron"
                className="h-9 w-9 rounded-xl ring-1 ring-slate-200 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              {toast.type === 'info' && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Notification
                </p>
              )}
              <p className={`text-sm ${toast.type === 'info' ? 'font-medium text-slate-900' : 'font-medium'} break-words`}>
                {toast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-current/70 hover:text-current"
              aria-label="Close toast"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
