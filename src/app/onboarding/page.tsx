"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"producer" | "seller">("seller");

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-16 h-16" /></div>
        <h2 className="text-xl font-semibold text-dark text-center mb-2">Welcome to Velion</h2>
        <p className="text-center text-muted text-sm mb-6">Let's set up your account.</p>
        
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium text-dark">What do you want to do?</h3>
            <button onClick={() => setRole("producer")} className={`w-full p-4 text-left border rounded-xl transition-colors ${role === 'producer' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <p className="font-medium text-dark">I am a Producer / Supplier</p>
              <p className="text-xs text-muted">List products, manage inventory, and fulfill orders.</p>
            </button>
            <button onClick={() => setRole("seller")} className={`w-full p-4 text-left border rounded-xl transition-colors ${role === 'seller' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <p className="font-medium text-dark">I am a Seller</p>
              <p className="text-xs text-muted">Buy products, sell to customers, and grow my business.</p>
            </button>
            <Button className="w-full mt-4" onClick={() => setStep(2)}>Continue</Button>
          </div>
        )}

        {step === 2 && role === "producer" && (
          <div className="space-y-4">
            <h3 className="font-medium text-dark">Supplier Details</h3>
            <input placeholder="Legal Company Name" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg" />
            <input placeholder="Registration Number" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg" />
            <input placeholder="Business Address" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg" />
            <input placeholder="Website URL" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg" />
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted text-sm cursor-pointer hover:bg-secondary/50">
              Upload Company Documents (PDF / Image)
            </div>
            <Button className="w-full" onClick={() => router.push("/dashboard/producer")}>Complete Onboarding</Button>
          </div>
        )}

        {step === 2 && role === "seller" && (
          <div className="space-y-4">
            <h3 className="font-medium text-dark">Store Details</h3>
            <input placeholder="Store Name" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg" />
            <select className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg">
              <option>Physical Store</option>
              <option>Digital Store</option>
              <option>Both</option>
            </select>
            <input placeholder="Store Address (if physical)" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg" />
            <input placeholder="Store URL (if digital)" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg" />
            <Button className="w-full" onClick={() => router.push("/dashboard/seller")}>Complete Onboarding</Button>
          </div>
        )}
      </div>
    </div>
  );
}
