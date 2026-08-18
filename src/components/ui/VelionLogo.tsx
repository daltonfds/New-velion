"use client";

export default function VelionLogo({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Anel tracejado que gira lentamente (agora em SVG para melhor controle) */}
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
      
      {/* Montanha/V invertido com traço dourado, pontas arredondadas e brilho sutil */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_6px_rgba(212,175,55,0.3)]">
        <path 
          // Contorno externo da montanha (V)
          d="M50 20 L85 85 M15 85 L50 20" 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="draw-mountain"
        />
        // Entalhe em V cortado na base a subir até ao meio
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
