import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function WithdrawPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-dark mb-6">Withdraw Funds</h1>
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 max-w-md">
        <p className="text-muted text-sm mb-4">Available Balance: <span className="text-primary font-bold">R 150.00</span></p>
        <div className="mb-4"><label className="block text-xs font-medium text-muted mb-1">Amount (R)</label><input type="number" placeholder="50.00" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" /></div>
        <div className="mb-6"><label className="block text-xs font-medium text-muted mb-1">Payout Method</label><select className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark"><option>M-Pesa</option><option>Bank Transfer</option></select></div>
        <Button className="w-full">Request Withdrawal</Button>
      </div>
    </DashboardLayout>
  );
}
