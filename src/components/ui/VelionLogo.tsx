"use client";

export default function VelionLogo({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Anel tracejado em SVG para melhor controle */}
      <svg viewBox="0 0 100 100" className="absolute w-[130%] h-[130%] animate-spin-slow">
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="1.5" 
          strokeDasharray="4 6" 
          opacity="0.3" 
        />
      </svg>
      
      {/* Montanha com V invertido, pontas arredondadas */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_6px_rgba(212,175,55,0.3)]">
        <path 
          d="M50 20 L85 85 M15 85 L50 20" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="draw-mountain"
        />
        <path 
          d="M45 85 L50 55 L55 85" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="draw-valley"
        />
      </svg>
    </div>
  );
}
