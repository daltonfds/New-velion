"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import { verifyEmailCode } from "@/app/register/actions";
import { useToast } from "@/components/ui/Toast";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      showToast("Please enter the 6-digit code.", "error");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", fullCode);
      await verifyEmailCode(formData);
    } catch (err: any) {
      showToast(err.message || "Verification failed", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
      <div className="flex justify-center mb-6">
        <VelionLogo className="w-28 h-28" />
      </div>
      <h2 className="text-xl font-semibold text-light-text text-center mb-1">Verify Code</h2>
      <p className="text-center text-light-muted text-sm mb-6">
        Enter the 6-digit code sent to <span className="font-medium text-light-text">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-12 text-center text-xl font-bold border border-light-border rounded-lg bg-secondary focus:outline-none focus:ring-2 focus:ring-primary text-light-text transition-colors"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full justify-center bg-primary text-white hover:bg-primary/90 rounded-full py-3"
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-center text-xs text-light-muted space-y-2">
          <p>Didn't receive the code? <button type="button" className="text-primary hover:underline">Resend code</button></p>
        </div>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-light-text">Loading verification page...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
