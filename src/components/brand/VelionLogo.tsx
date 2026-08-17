"use client";

import { motion } from "framer-motion";

export default function VelionLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/25"
          animate={{ rotate: 360 }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <svg
          viewBox="0 0 100 100"
          className="h-9 w-9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M10 82 L48 18 Q50 15 52 18 L90 82 M10 82 L37 82 L50 55 L63 82 L90 82"
            stroke="#D4AF37"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.4,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>

      <span className="text-2xl font-semibold tracking-[-0.04em] text-[#1A1A1A]">
        Velion
      </span>
    </div>
  );
}
