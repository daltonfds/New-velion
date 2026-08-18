"use client";

export default function VelionLogo({ className = "w-24 h-24", showText = true }: { className?: string, showText?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-full h-full flex justify-center items-center">
        {/* Anel tracejado giratório */}
        <div className="absolute w-[120%] h-[120%] rounded-full border-2 border-dashed border-yellow-500/20 animate-spin-slow" />
        
        {/* Desenho da Montanha Dourada com o "V" entalhado */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          <path 
            d="M50 15 L85 80 L15 80 Z" 
            fill="none" 
            stroke="#D4AF37" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="draw-mountain"
          />
          <path 
            d="M45 80 L50 50 L55 80" 
            fill="none" 
            stroke="#D4AF37" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="draw-valley"
          />
        </svg>
      </div>
      {showText && <span className="mt-2 font-display text-xl tracking-wide text-[#D4AF37] font-semibold">Velion</span>}
    </div>
  );
}
