"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Link from "next/link";

export default function ApplyPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { id: "seller", label: "Sell Products", desc: "I want to sell products to customers." },
    { id: "producer", label: "Produce Products", desc: "I manufacture goods and want to supply sellers." },
    { id: "supplier", label: "Supply Products", desc: "I distribute or wholesale existing products." },
    { id: "produce_supply", label: "Produce & Supply", desc: "I both produce and distribute goods." },
  ];

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-light-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-28 h-28" /></div>
        <h2 className="text-2xl font-bold text-light-text text-center mb-1">What do you want to do on Velion?</h2>
        <p className="text-center text-light-muted text-sm mb-6">Choose your path to start climbing.</p>

        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected === opt.id ? "border-primary bg-primary/5" : "border-light-border hover:bg-secondary/50"
              }`}
            >
              <p className="font-medium text-light-text">{opt.label}</p>
              <p className="text-sm text-light-muted">{opt.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Link href={selected ? `/apply/${selected}` : "#"}>
            <button
              disabled={!selected}
              className="w-full py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
