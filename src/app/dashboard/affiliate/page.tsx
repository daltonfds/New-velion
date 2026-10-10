"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  referral_code: string;
  referrals_total: number;
  active_referrals: number;
  rewards_earned: number;
  rewards_pending: number;
  mystery_prizes_unlocked: number;
  next_milestone: number | null;
};
type Reward = { id: string; reward_type: string; amount: number; status: string; description: string; created_at: string; milestone_count: number | null };

const money = (value: number) => "R" + new Intl.NumberFormat("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);

export default function PlatformAffiliateDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Please sign in to view your affiliate dashboard.");
      setLoading(false);
      return;
    }
    const { error: enrollmentError } = await supabase.rpc("join_platform_affiliate_program");
    if (enrollmentError) {
      setError(enrollmentError.message);
      setLoading(false);
      return;
    }
    const [{ data: dashboardData, error: dashboardError }, { data: rewardData, error: rewardError }] = await Promise.all([
      supabase.rpc("get_platform_affiliate_dashboard"),
      supabase.from("platform_affiliate_rewards").select("id,reward_type,amount,status,description,created_at,milestone_count").eq("affiliate_user_id", user.id).order("created_at", { ascending: false }).limit(25),
    ]);
    if (dashboardError) setError(dashboardError.message);
    if (rewardError) setError((current) => current ? current + " " + rewardError.message : rewardError.message);
    const row = Array.isArray(dashboardData) ? dashboardData[0] : dashboardData;
    if (row) setStats({
      referral_code: row.referral_code,
      referrals_total: Number(row.referrals_total || 0),
      active_referrals: Number(row.active_referrals || 0),
      rewards_earned: Number(row.rewards_earned || 0),
      rewards_pending: Number(row.rewards_pending || 0),
      mystery_prizes_unlocked: Number(row.mystery_prizes_unlocked || 0),
      next_milestone: row.next_milestone == null ? null : Number(row.next_milestone),
    });
    setRewards((rewardData || []) as Reward[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const makeLink = (path: string) => typeof window === "undefined" || !stats ? "" : window.location.origin + path + "?ref=" + encodeURIComponent(stats.referral_code);
  const copyLink = async (path: string, label: string) => {
    const url = makeLink(path);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(label);
    } catch {
      setError("Could not copy automatically. Copy this link: " + url);
    }
  };

  const progress = stats?.next_milestone ? Math.min(100, stats.active_referrals / stats.next_milestone * 100) : 100;

  return (
    <AppShell area="affiliate">
      <main className="min-h-screen bg-[#F5F8FC]">
        <div className="mx-auto max-w-[1250px] space-y-6 px-5 py-7 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0078E8]">Partner program</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#001B44]">Your affiliate dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Share your referral links. A signup is a registration; an account becomes active only after its first confirmed sale.</p>
            <p className="mt-2 rounded-lg border border-blue-100 bg-[#EAF3FF] px-4 py-3 text-sm font-medium text-[#003B95]">Affiliate rewards balance — separate from your seller sales wallet or supplier balance.</p>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Registered referrals", stats?.referrals_total ?? 0, "Accounts registered through your links"],
              ["Active referrals", stats?.active_referrals ?? 0, "At least one confirmed paid sale"],
              ["Rewards earned", money(stats?.rewards_earned ?? 0), "R50 per referred account's first sale"],
              ["Mystery prizes", stats?.mystery_prizes_unlocked ?? 0, "Milestones unlocked"],
            ].map(([label, value, note]) => <Card key={String(label)} className="border-[#DCE3EE] bg-white p-5 shadow-none"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold text-[#001B44]">{loading ? "—" : value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></Card>)}
          </section>

          <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div><p className="text-sm font-semibold text-[#003B95]">Your referral code</p><p className="mt-2 text-2xl font-bold tracking-wider text-[#001B44]">{loading ? "Loading…" : stats?.referral_code || "Not available"}</p><p className="mt-1 text-sm text-slate-500">Share the right link for the type of partner you want to invite.</p></div>
              <button type="button" onClick={() => void copyLink("/register", "seller")} disabled={!stats} className="rounded-lg bg-[#003B95] px-4 py-3 text-sm font-semibold text-white hover:bg-[#002B70] disabled:opacity-50">{copied === "seller" ? "Seller link copied" : "Copy seller referral link"}</button>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 break-all">{stats ? makeLink("/register") : "Seller registration link"}</div>
              <button type="button" onClick={() => void copyLink("/register/supplier", "supplier")} disabled={!stats} className="rounded-lg border border-[#BFD7F8] px-4 py-3 text-sm font-semibold text-[#003B95] hover:bg-[#EAF3FF] disabled:opacity-50">{copied === "supplier" ? "Supplier link copied" : "Copy supplier / producer link"}</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Self-referrals are not rewarded. R50 is recorded once per referred account after a confirmed paid sale; signups alone do not unlock rewards.</p>
          </Card>

          <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[#003B95]">Mystery prize challenge</p><h2 className="mt-1 text-xl font-bold text-[#001B44]">Reach your next active-referral milestone</h2><p className="mt-1 text-sm text-slate-500">Mystery prizes unlock at 5, 10 and 25 active referred businesses.</p></div><p className="text-sm font-semibold text-[#001B44]">{stats?.active_referrals ?? 0} active {stats?.next_milestone ? "/ " + stats.next_milestone : "— all milestones reached"}</p></div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#EAF3FF]" role="progressbar" aria-label="Next mystery prize progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><div className="h-full rounded-full bg-[#0078E8] transition-all" style={{ width: progress + "%" }} /></div>
            <div className="mt-3 flex flex-wrap gap-2">{[5, 10, 25].map((target) => <span key={target} className={"rounded-full px-3 py-1 text-xs font-semibold " + ((stats?.active_referrals || 0) >= target ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600")}>{target} active · {((stats?.active_referrals || 0) >= target) ? "Unlocked" : "Mystery prize"}</span>)}</div>
          </Card>

          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <Card className="border-[#DCE3EE] bg-white p-0 shadow-none">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-[#001B44]">Reward history</h2><p className="mt-1 text-xs text-slate-500">Rewards are created from confirmed sales and active-referral milestones.</p></div>
            {loading ? <div className="px-5 py-10 text-sm text-slate-500">Loading rewards…</div> : rewards.length === 0 ? <div className="px-5 py-10 text-center"><p className="font-semibold text-[#001B44]">No rewards yet</p><p className="mt-1 text-sm text-slate-500">Share your link to start referring sellers and suppliers.</p></div> : <div className="divide-y divide-slate-100">{rewards.map((reward) => <div key={reward.id} className="flex flex-col justify-between gap-2 px-5 py-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-[#001B44]">{reward.description}</p><p className="mt-1 text-xs text-slate-500">{new Date(reward.created_at).toLocaleDateString()} · {reward.reward_type === "mystery_prize" ? "Milestone " + reward.milestone_count : "Referral reward"}</p></div><div className="flex items-center gap-3"><span className="text-sm font-bold text-[#001B44]">{reward.reward_type === "mystery_prize" ? "Mystery prize" : money(Number(reward.amount))}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#003B95]">{reward.status}</span></div></div>)}</div>}
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
