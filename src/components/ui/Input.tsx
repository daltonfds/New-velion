import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-800">
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink-900",
          "transition-colors duration-150 placeholder:text-ink-400",
          "hover:border-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500",
          error
            ? "border-red-600 focus-visible:ring-red-600"
            : "border-ink-300 focus-visible:border-brand-600 focus-visible:ring-brand-600",
          className,
        )}
        {...props}
      />

      {error && (
        <p id={errorId} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
