import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

interface StarsProps {
  rating: number;
  size?: number;
  className?: string;
}

/** Estrelas em SVG (substitui os glifos ★/☆). Aceita notas fracionárias arredondadas ao inteiro. */
export default function Stars({ rating, size = 16, className }: StarsProps) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span role="img" aria-label={`${full} out of 5`} className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          width={size}
          height={size}
          strokeWidth={1.75}
          className={i < full ? "fill-amber-500 text-amber-500" : "fill-transparent text-ink-300"}
        />
      ))}
    </span>
  );
}
