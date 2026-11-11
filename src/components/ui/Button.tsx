import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  [
    "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap",
    "rounded-lg font-semibold transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress",
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
        secondary:
          "border border-ink-300 bg-white text-ink-800 hover:border-ink-400 hover:bg-ink-50 active:bg-ink-100",
        danger: "bg-red-700 text-white hover:bg-red-800 active:bg-red-900 focus-visible:ring-red-700",
        ghost: "bg-transparent text-ink-600 hover:bg-ink-100 active:bg-ink-200",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-10 px-4 text-sm",
        lg: "min-h-12 px-5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof button> {
  /** Mostra barra de progresso fina e bloqueia cliques. Não troca o texto. */
  loading?: boolean;
}

export default function Button({
  variant,
  size,
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(button({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
      {loading ? (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
          <span className="block h-full w-1/3 animate-nv-slide bg-current opacity-60" />
        </span>
      ) : null}
    </button>
  );
}
