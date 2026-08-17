"use client";

import { useState } from "react";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ProducerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  const steps = ["Business Info", "Company Address", "Documents"];
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-16 h-16" /></div>
        <h2 className="text-xl font-semibold text-dark text-center">Supplier Onboarding</h2>
        
        {/* Visual Stepper */}
        <div className="flex justify-between items-center mt-6 mb-8 relative">
          <div className="absolute w-full h-1 bg-gray-200 top-1/2 -translate-y-1/2 z-0" />
          <div className="absolute w-1/2 h-1 bg-primary top-1/2 -translate-y-1/2 z-0 transition-all duration-300" style={{ width: `${((step-1) / (steps.length-1)) * 100}%` }} />
          {steps.map((s, i) => (
            <div key={i} className={`relative z-10 flex flex-col items-center ${i+1 <= step ? "text-primary" : "text-muted"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${i+1 <= step ? "bg-primary border-primary text-white" : "bg-white border-gray-300 text-gray-400"}`}>{i+1}</div>
              <span className="text-[10px] mt-1 font-medium">{s}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4 min-h-[200px]">
          {step === 1 && <div><label className="text-xs text-muted">Legal Business Name</label><input className="w-full px-4 py-2 border rounded-lg mt-1" placeholder="Velion Ltd" /><label className="text-xs text-muted mt-4 block">Registration Number</label><input className="w-full px-4 py-2 border rounded-lg mt-1" placeholder="123456" /></div>}
          {step === 2 && <div><label className="text-xs text-muted">Business Address</label><input className="w-full px-4 py-2 border rounded-lg mt-1" placeholder="123 Main St" /><label className="text-xs text-muted mt-4 block">Website (Optional)</label><input className="w-full px-4 py-2 border rounded-lg mt-1" placeholder="https://..." /></div>}
          {step === 3 && <div><label className="text-xs text-muted">Upload Company Documents</label><div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted text-sm cursor-pointer">Click to upload PDF or Image</div></div>}
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>Back</Button>
          {step < 3 ? <Button onClick={nextStep}>Continue</Button> : <Button onClick={() => router.push("/dashboard/producer")}>Complete Onboarding</Button>}
        </div>
      </div>
    </div>
  );
}
