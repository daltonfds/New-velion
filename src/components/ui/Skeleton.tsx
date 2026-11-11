import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Bloco de carregamento. Dê-lhe a altura/largura do conteúdo real via className. */
export default function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-ink-100", className)} {...props} />;
}

interface LoadingBlockProps {
  label?: string;
  className?: string;
  page?: boolean;
  rows?: number;
}

/** Estado de carregamento em skeleton (substitui o texto "Loading…"). O rótulo fica para leitores de ecrã. */
export function LoadingBlock({ label = "Loading…", className, page = false, rows = 3 }: LoadingBlockProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        page ? "mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center gap-4 px-5 py-16" : "space-y-3 py-4",
        className,
      )}
    >
      <Skeleton className="h-6 w-1/3" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
