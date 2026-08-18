"use client";

export default function VelionLogo({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Anel tracejado a girar lentamente */}
      <div className="absolute w-[130%] h-[130%] rounded-full border-2 border-dashed border-yellow-500/30 animate-spin-slow" />
      
      {/* Montanha Dourada com entalhe em V */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
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
  );
}
