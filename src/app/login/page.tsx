import VelionLogo from "@/components/ui/VelionLogo";
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-sm p-8">
        <div className="flex justify-center mb-6"><VelionLogo className="w-20 h-20" /></div>
        <h2 className="text-xl font-semibold text-dark text-center mb-1">Sign In</h2>
        <p className="text-center text-muted text-sm mb-6">Enter your Velion account.</p>
        <form className="space-y-4">
          <div><label className="block text-xs font-medium text-muted mb-1">Email</label><input type="email" placeholder="you@example.com" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-dark" /></div>
          <div><label className="block text-xs font-medium text-muted mb-1">Password</label><input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-dark" /></div>
          <button className="w-full py-3 mt-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90">Sign In</button>
        </form>
        <div className="mt-6 text-center text-xs text-muted">Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Sign up</a></div>
      </div>
    </div>
  );
}
