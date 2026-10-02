"use client";

import { notify } from "@/lib/notify";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const styles: Record<
  ToastType,
  {
    border: string;
    background: string;
    iconBackground: string;
    icon: string;
  }
> = {
  success: {
    border: "border-emerald-200",
    background: "bg-emerald-50",
    iconBackground: "bg-emerald-100",
    icon: "text-emerald-600",
  },
  error: {
    border: "border-red-200",
    background: "bg-red-50",
    iconBackground: "bg-red-100",
    icon: "text-red-600",
  },
  warning: {
    border: "border-amber-200",
    background: "bg-amber-50",
    iconBackground: "bg-amber-100",
    icon: "text-amber-600",
  },
  info: {
    border: "border-blue-200",
    background: "bg-blue-50",
    iconBackground: "bg-blue-100",
    icon: "text-blue-600",
  },
};

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
};

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: (id: number) => void;
}) {
  const style = styles[toast.type];

  useEffect(() => {
    const timer = window.setTimeout(
      () => onClose(toast.id),
      toast.duration ?? 4500,
    );

    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border ${style.border} ${style.background} p-4 text-slate-900`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.iconBackground} ${style.icon} text-sm font-bold`}
      >
        {icons[toast.type]}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.message ? (
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {toast.message}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
        className="shrink-0 text-lg leading-none text-slate-400 hover:text-slate-700"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return notify.subscribe((toast) => {
      const id = Date.now() + Math.random();

      setToasts((current) => [
        ...current.slice(-3),
        {
          ...toast,
          id,
        },
      ]);
    });
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Date.now() + Math.random();

    setToasts((current) => [
      ...current.slice(-3),
      {
        ...options,
        id,
      },
    ]);
  }, []);

  const success = useCallback(
    (title: string, message?: string) =>
      showToast({ type: "success", title, message }),
    [showToast],
  );

  const error = useCallback(
    (title: string, message?: string) =>
      showToast({ type: "error", title, message }),
    [showToast],
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      showToast({ type: "warning", title, message }),
    [showToast],
  );

  const info = useCallback(
    (title: string, message?: string) =>
      showToast({ type: "info", title, message }),
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-md flex-col gap-3"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
