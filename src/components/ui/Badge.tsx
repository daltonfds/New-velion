import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badge = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold leading-5",
  {
    variants: {
      variant: {
        default: "bg-ink-100 text-ink-700",
        success: "bg-[#E3F4EC] text-[#0B5F43]",
        warning: "bg-[#FBF0D9] text-[#7A4E00]",
        danger: "bg-[#FBE5E5] text-[#8A1F1F]",
        info: "bg-brand-50 text-brand-600",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export default function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={cn(badge({ variant }), className)} {...props} />;
}
