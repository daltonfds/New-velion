"use client";

import { useEffect, useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";
import Particles from "@tsparticles/react";

export default function LandingPage() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    const initParticles = async () => {
      // Importação dinâmica para evitar o conflito de tipos do TypeScript com o default export
      const { initParticlesEngine } = await import("@tsparticles/react");
      const { loadSlim } = await import("@tsparticles/slim");
      await initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
      setInit(true);
    };
    initParticles();
  }, []);

  return (
    <div className="min-h-screen bg-secondary relative overflow-hidden flex flex-col items-center justify-center p-6">
      {init && (
        <Particles
          id="tsparticles"
          options={{
            background: { color: { value: "#F4F4F7" } },
            fpsLimit: 120,
            interactivity: {
              events: { onHover: { enable: true, mode: "repulse" } },
              modes: { repulse: { distance: 100, duration: 0.4 } },
            },
            particles: {
              color: { value: "#5946E6" },
              links: { color: "#5946E6", distance: 150, enable: true, opacity: 0.2, width: 1 },
              move: { enable: true, speed: 1, direction: "none", random: false, straight: false },
              number: { density: { enable: true }, value: 80 },
              opacity: { value: 0.3 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 5 } },
            },
            detectRetina: true,
          }}
        />
      )}
      
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg border border-white/40 shadow-2xl rounded-2xl p-8 flex flex-col items-center text-center">
        <div className="mb-6">
          <VelionLogo className="w-32 h-32" />
        </div>
        <h1 className="text-2xl font-bold text-dark mb-2 font-display">The climb starts here.</h1>
        <p className="text-muted text-sm mb-2 max-w-xs">Marketplace, warehousing, and fulfillment for your business.</p>
        <p className="text-primary/80 text-xs mb-8 max-w-xs font-medium italic">"From producer to customer, we handle the rest."</p>
        <div className="w-full space-y-3">
          <Link href="/login">
            <button className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg shadow-primary/25">Sign In</button>
          </Link>
          <Link href="/register">
            <button className="w-full py-3 bg-white text-dark border border-border rounded-full font-medium hover:bg-secondary transition-all transform hover:scale-105">Create Account</button>
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted">&copy; 2026 Velion. All rights reserved.</p>
      </div>
    </div>
  );
}
