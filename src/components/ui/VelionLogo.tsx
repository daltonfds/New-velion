"use client";

export default function VelionLogo({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Anel tracejado a girar lentamente */}
      <div className="absolute w-[130%] h-[130%] rounded-full border-2 border-dashed border-yellow-500/30 animate-spin-slow" />
      
      {/* Montanha com V invertido (abertura inferior), não um triângulo fechado */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path 
          d="M50 15 L85 75 M15 75 L50 15 M45 75 L50 45 L55 75" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="draw-mountain"
        />
      </svg>
    </div>
  );
}
