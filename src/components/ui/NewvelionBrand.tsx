"use client";

import { motion, useReducedMotion } from "framer-motion";

interface NewvelionBrandProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: {
    icon: 30,
    bars: [12, 17, 22],
    name: "text-lg",
    tagline: "text-[8px]",
  },
  md: {
    icon: 42,
    bars: [17, 24, 31],
    name: "text-2xl",
    tagline: "text-[9px]",
  },
  lg: {
    icon: 58,
    bars: [23, 33, 43],
    name: "text-4xl",
    tagline: "text-[11px]",
  },
};

export default function NewvelionBrand({
  size = "md",
  className = "",
}: NewvelionBrandProps) {
  const reduceMotion = useReducedMotion();
  const config = sizes[size];

  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="Newvelion — Commerce infrastructure"
    >
      <svg
        width={config.icon}
        height={config.icon}
        viewBox="0 0 58 58"
        fill="none"
        role="img"
        aria-hidden="true"
      >
        {[0, 1, 2].map((index) => {
          const heights = [23, 33, 43];
          const x = [5, 20, 35][index];
          const y = 48 - heights[index];

          return (
            <motion.rect
              key={index}
              x={x}
              y={y}
              width="9"
              height={heights[index]}
              rx="4.5"
              fill="#C99A2E"
              initial={
                reduceMotion
                  ? false
                  : {
                      scaleY: 0,
                      opacity: 0,
                      originY: 1,
                    }
              }
              animate={{
                scaleY: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.75,
                delay: index * 0.35,
                ease: "easeOut",
              }}
            />
          );
        })}
      </svg>

      <div className="flex flex-col">
        <span
          className={`${config.name} font-bold leading-none tracking-[-0.04em] text-[#16294F]`}
        >
          Newvelion
        </span>

        <span
          className={`${config.tagline} mt-1 font-medium uppercase tracking-[0.18em] text-[#8A8570]`}
        >
          Commerce infrastructure
        </span>
      </div>
    </div>
  );
}
