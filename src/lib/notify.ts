import type { ToastType } from "@/components/ui/Toast";

type ToastPayload = {
  type: ToastType;
  title: string;
  message?: string;
};

type ToastListener = (toast: ToastPayload) => void;

const listeners = new Set<ToastListener>();

export const notify = {
  subscribe(listener: ToastListener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  show(toast: ToastPayload) {
    listeners.forEach((listener) => listener(toast));
  },

  success(title: string, message?: string) {
    this.show({ type: "success", title, message });
  },

  error(title: string, message?: string) {
    this.show({ type: "error", title, message });
  },

  warning(title: string, message?: string) {
    this.show({ type: "warning", title, message });
  },

  info(title: string, message?: string) {
    this.show({ type: "info", title, message });
  },
};
