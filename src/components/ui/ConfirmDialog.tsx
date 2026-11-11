"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

type ConfirmFn = (options: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Substitui window.confirm por um Dialog acessível. Uso: if (!(await confirmAction({ ... }))) return; */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((input) => {
    const next = typeof input === "string" ? { message: input } : input;
    return new Promise<boolean>((resolve) => {
      resolver.current?.(false);
      resolver.current = resolve;
      setOptions(next);
    });
  }, []);

  function settle(value: boolean) {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={options !== null}
        onClose={() => settle(false)}
        title={options?.title ?? "Please confirm"}
        description={options?.message}
        className="sm:max-w-sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              {options?.cancelLabel ?? "Cancel"}
            </Button>
            <Button variant={options?.tone === "danger" ? "danger" : "primary"} onClick={() => settle(true)}>
              {options?.confirmLabel ?? "Confirm"}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  return context ?? ((input) => Promise.resolve(window.confirm(typeof input === "string" ? input : input.message)));
}
