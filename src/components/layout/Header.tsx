import VelionLogo from "@/components/ui/VelionLogo";
import Button from "@/components/ui/Button";

interface HeaderProps {
  userType?: "seller" | "admin";
}

export default function Header({ userType = "seller" }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-border">
      <div className="flex items-center gap-3">
        <VelionLogo className="w-10 h-10" showText={false} />
        <div>
          <span className="font-display text-lg font-semibold text-dark">Velion</span>
          <span className="block text-[10px] uppercase tracking-wider text-muted">{userType === "admin" ? "Admin" : "Seller"}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="px-3">🔔</Button>
        <Button variant="ghost" className="px-3">👤</Button>
      </div>
    </header>
  );
}
