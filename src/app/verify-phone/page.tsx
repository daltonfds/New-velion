"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";
import { verifyPhoneCode } from "@/app/register/actions";
import { useToast } from "@/components/ui/Toast";

// Componente que usa useSearchParams (envolvido em Suspense)
function VerifyPhoneForm() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("phone", phone);
      await verifyPhoneCode(formData);
    } catch (err: any) {
      setError(err.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-light-border shadow-sm p-8">
      <div className="flex justify-center mb-6">
        <VelionLogo className="w-28 h-28" />
      </div>
      <h2 className="text-xl font-semibold text-light-text text-center mb-1">Verify Code</h2>
      <p className="text-center text-light-muted text-sm mb-6">
        Enter the 6-digit code sent to <span className="font-medium text-light-text">{phone}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-light-muted mb-1">Verification Code</label>
          <input 
            type="text" 
            name="token" 
            placeholder="123456" 
            className="w-full px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text text-center tracking-widest text-2xl" 
            maxLength={6}
            required 
          />
        </div>
        {error && <p className="text-sm text-rose-600 text-center bg-rose-50 p-2 rounded-lg">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full justify-center bg-primary text-white hover:bg-primary/90 rounded-full">Verify</Button>
      </form>
    </div>
  );
}

// Página principal que envolve o formulário com Suspense
export default function VerifyPhonePage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-light-text">Loading verification page...</div>}>
        <VerifyPhoneForm />
      </Suspense>
    </div>
  );
}
