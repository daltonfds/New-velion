'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface VelionLogoProps {
  size?: number
  withWordmark?: boolean
  className?: string
}

export default function VelionLogo({ size = 40, withWordmark = true, className = '' }: VelionLogoProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="Velion">
        {/* Anel tracejado com maior opacidade para ficar visível no fundo claro */}
        <motion.circle
          cx={32}
          cy={32}
          r={27}
          stroke="#D4AF37"
          strokeOpacity={0.7}
          strokeWidth={1.5}
          strokeDasharray="3 5"
          fill="none"
          initial={reduceMotion ? false : { rotate: 0, opacity: 0 }}
          animate={{ rotate: 360, opacity: 1 }}
          transition={{
            opacity: { duration: 1, delay: 0.4 },
            rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
          }}
          style={{ transformOrigin: '32px 32px' }}
        />
        {/* Montanha / V invertido a desenhar-se */}
        <motion.path
          d="M32 12 L52 48 H38 L32 34 L26 48 H12 Z"
          stroke="#D4AF37"
          strokeWidth={3.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
      </svg>
      {withWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight text-light-text">Velion</span>
      )}
    </div>
  )
}
