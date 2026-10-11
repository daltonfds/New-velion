"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerNav from "@/components/customer/CustomerNav";
import { supabase } from "@/lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name?: string | null; role?: string | null; country_code?: string | null } | null>(null);
  const [summary, setSummary] = useState({ orders: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const [{ data: p }, { count: orderCount }, { count: reviewCount }] = await Promise.all([
        supabase.from("profiles").select("full_name,role,country_code").eq("id", user.id).maybeSingle(),
        supabase.from("sales").select("id", { count: "exact", head: true }).eq("customer_id", user.id),
        supabase.from("product_reviews").select("id", { count: "exact", head: true }).eq("reviewer_id", user.id),
      ]);
      if (!active) return;
      if (p?.role !== "customer") { router.replace("/dashboard"); return; }
      setProfile(p);
      setSummary({ orders: orderCount || 0, reviews: reviewCount || 0 });
      setLoading(false);
    })();
    return () => { active = false; };
  }, [router]);

  if (loading) return <main className="grid min-h-screen place-items-center text-sm text-slate-500">Loading account…</main>;

  const links = [
    { title: "My orders", description: "See every purchase, status and delivery tracking.", href: "/account/orders", metric: String(summary.orders), action: "View orders" },
    { title: "My reviews", description: "Read testimonials you have submitted and review eligible purchases.", href: "/account/reviews", metric: String(summary.reviews), action: "Manage reviews" },
    { title: "Club membership", description: "Explore member discounts, free delivery and exclusive promotions.", href: "/account/membership", metric: "Membership", action: "Explore plans" },
    { title: "Favorites", description: "Keep products you want to buy later.", href: "/account/favorites", metric: "Saved", action: "View favorites" },
    { title: "Addresses", description: "Manage delivery addresses for your purchases.", href: "/account/addresses", metric: "Delivery", action: "Manage addresses" },
    { title: "Shop marketplace", description: "Discover products available across Newvelion.", href: "/marketplace", metric: "Marketplace", action: "Start shopping" },
  ];

  return (
    <main className="min-h-screen bg-[#F5F8FC]">
      <CustomerNav name={profile?.full_name} />
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <section className="rounded-3xl bg-[#003B95] p-7 text-white sm:p-10">
          <p className="text-sm font-semibold text-blue-100">My Newvelion account</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome, {profile?.full_name || "Customer"}</h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-100 sm:text-base">Your purchases, product reviews and membership — all in one place.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/account/orders" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#003B95] hover:bg-blue-50">View my purchases</Link>
            <Link href="/account/membership" className="rounded-xl border border-white/50 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Explore club membership</Link>
          </div>
        </section>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#0078E8] hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-[#001B44]">{item.title}</h2>
                <span className="rounded-lg bg-[#EAF3FF] px-3 py-1 text-xs font-bold text-[#003B95]">{item.metric}</span>
              </div>
              <p className="mt-3 min-h-10 text-sm leading-6 text-slate-500">{item.description}</p>
              <p className="mt-5 text-sm font-bold text-[#0078E8] group-hover:text-[#003B95]">{item.action} →</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
