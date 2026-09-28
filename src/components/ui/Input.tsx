import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={[
          "w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900",
          "outline-none transition",
          "placeholder:text-gray-400",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : "border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100",
          className,
        ].join(" ")}
        {...props}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
