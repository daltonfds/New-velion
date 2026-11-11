import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-ink-200 bg-white shadow-sm", className)}
      {...props}
    />
  );
}
