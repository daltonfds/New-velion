'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function WelcomeFigure({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={className}>
      <svg width="180" height="200" viewBox="0 0 180 200" fill="none" aria-hidden="true">
        {/* Montanhas de fundo */}
        <path d="M0 170 L60 110 L90 140 L130 90 L180 170 Z" fill="url(#ridgeGradient)" opacity={0.4} />
        <defs>
          <linearGradient id="ridgeGradient" x1="0" y1="90" x2="0" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4AF37" stopOpacity={0.25} />
            <stop offset="1" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Personagem em si - trocado de pearl (branco) para dark (preto/cinza escuro) para aparecer */}
        <motion.g
          initial={false}
          animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="88" cy="98" r="9" stroke="#1A1A1A" strokeWidth={2.5} fill="none" />
          {/* Corpo e pernas */}
          <path
            d="M88 107 L88 140 M88 118 L72 128 M88 140 L76 165 M88 140 L100 165"
            stroke="#1A1A1A"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
          />
          {/* Braço dourado a acenar (animado) */}
          <motion.path
            d="M88 118 L104 100"
            stroke="#D4AF37"
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            style={{ transformOrigin: '88px 118px' }}
            animate={reduceMotion ? undefined : { rotate: [0, 18, 0, 18, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
          />
        </motion.g>
      </svg>
    </div>
  )
}
