"use client";

import { motion, useReducedMotion } from "framer-motion";

interface NewvelionBrandProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTagline?: boolean;
}

const sizes = {
  sm: {
    icon: 38,
    name: "text-xl",
    tagline: "text-[8px]",
  },
  md: {
    icon: 52,
    name: "text-3xl",
    tagline: "text-[9px]",
  },
  lg: {
    icon: 68,
    name: "text-4xl sm:text-5xl",
    tagline: "text-[10px] sm:text-[11px]",
  },
};

export default function NewvelionBrand({
  size = "md",
  className = "",
  showTagline = true,
}: NewvelionBrandProps) {
  const reduceMotion = useReducedMotion();
  const config = sizes[size];

  const bars = [
    { x: 5, height: 23 },
    { x: 20, height: 33 },
    { x: 35, height: 43 },
  ];

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="Newvelion — The climbing starts here"
    >
      <svg
        width={config.icon}
        height={config.icon}
        viewBox="0 0 58 58"
        fill="none"
        role="img"
        aria-hidden="true"
      >
        {bars.map((bar, index) => {
          const y = 48 - bar.height;

          return (
            <motion.rect
              key={bar.x}
              x={bar.x}
              y={y}
              width="9"
              height={bar.height}
              rx="4.5"
              fill="#C99A2E"
              style={{ transformOrigin: `${bar.x + 4.5}px 48px` }}
              initial={
                reduceMotion
                  ? { scaleY: 1, opacity: 1 }
                  : { scaleY: 0, opacity: 0 }
              }
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{
                duration: 1.1,
                delay: index * 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </svg>

      <div className="flex flex-col">
        <span
          className={`${config.name} font-bold leading-none tracking-[-0.055em] text-[#16294F]`}
        >
          Newvelion
        </span>

        {showTagline && (
          <span
            className={`${config.tagline} mt-1 font-medium uppercase tracking-[0.2em] text-[#8A8570]`}
          >
            Commerce infrastructure
          </span>
        )}
      </div>
    </div>
  );
}
