"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

interface Sale {
  id: string;
  product_id: string;
  valor_venda: number | null;
  comissao_vendedor: number | null;
  status: string | null;
  vendido_em: string;
  product: { nome: string; moeda: string } | { nome: string; moeda: string }[] | null;
}

type Period = "day" | "week" | "month" | "year" | "custom";

const localDate = (date: Date) => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(value || 0).replace("ZAR", "R").replace("R ", "R");

const productName = (product: Sale["product"]) =>
  Array.isArray(product) ? product[0]?.nome || "Product" : product?.nome || "Product";

export default function SellerPerformancePage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [startDate, setStartDate] = useState(() => localDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [endDate, setEndDate] = useState(() => localDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const user = await getCurrentUser();
    if (!user) {
      setError("You must be signed in to view analytics.");
      setLoading(false);
      return;
    }
    const { data, error: queryError } = await supabase
      .from("sales")
      .select("id,product_id,valor_venda,comissao_vendedor,status,vendido_em,product:products(nome,moeda)")
      .eq("vendedor_id", user.id)
      .order("vendido_em", { ascending: true });
    if (queryError) setError(queryError.message);
    setSales((data || []) as unknown as Sale[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const range = useMemo(() => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    if (period === "day") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (period === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      start = startDate ? new Date(startDate + "T00:00:00") : new Date(0);
      end = endDate ? new Date(endDate + "T23:59:59.999") : new Date();
    }
    return { start, end };
  }, [period, startDate, endDate]);

  const paidSales = useMemo(() => sales.filter((sale) => {
    const status = String(sale.status || "").toLowerCase();
    const date = new Date(sale.vendido_em);
    return (status === "paga" || status === "paid") && date >= range.start && date <= range.end;
  }), [sales, range]);

  const metrics = useMemo(() => {
    const revenue = paidSales.reduce((sum, sale) => sum + Number(sale.valor_venda || 0), 0);
    const commission = paidSales.reduce((sum, sale) => sum + Number(sale.comissao_vendedor || 0), 0);
    const products = new Set(paidSales.map((sale) => sale.product_id)).size;
    return { count: paidSales.length, revenue, commission, average: paidSales.length ? revenue / paidSales.length : 0, products };
  }, [paidSales]);

  const chart = useMemo(() => {
    const days = Math.max(1, Math.ceil((range.end.getTime() - range.start.getTime()) / 86400000) + 1);
    const buckets = new Map<string, { label: string; commission: number; sales: number; revenue: number }>();
    const add = (key: string, label: string, sale: Sale) => {
      const current = buckets.get(key) || { label, commission: 0, sales: 0, revenue: 0 };
      current.commission += Number(sale.comissao_vendedor || 0);
      current.sales += 1;
      current.revenue += Number(sale.valor_venda || 0);
      buckets.set(key, current);
    };
    const groupedByMonth = period === "year" || (period === "custom" && days > 120);
    const groupedByHour = period === "day";
    paidSales.forEach((sale) => {
      const date = new Date(sale.vendido_em);
      if (groupedByHour) {
        const key = String(date.getHours()).padStart(2, "0");
        add(key, key + ":00", sale);
      } else if (groupedByMonth) {
        const key = keyMonth(date);
        add(key, date.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" }), sale);
      } else {
        const key = localDate(date);
        add(key, date.toLocaleDateString("en-ZA", { day: "numeric", month: "short" }), sale);
      }
    });
    const entries = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
    if (groupedByHour) {
      return Array.from({ length: 24 }, (_, hour) => buckets.get(String(hour).padStart(2, "0")) || { label: String(hour).padStart(2, "0") + ":00", commission: 0, sales: 0, revenue: 0 });
    }
    return entries.map(([, value]) => value);
  }, [paidSales, period, range]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; sales: number; revenue: number; commission: number }>();
    paidSales.forEach((sale) => {
      const item = map.get(sale.product_id) || { name: productName(sale.product), sales: 0, revenue: 0, commission: 0 };
      item.sales += 1;
      item.revenue += Number(sale.valor_venda || 0);
      item.commission += Number(sale.comissao_vendedor || 0);
      map.set(sale.product_id, item);
    });
    return [...map.values()].sort((a, b) => b.commission - a.commission).slice(0, 8);
  }, [paidSales]);

  const maxCommission = Math.max(1, ...chart.map((point) => point.commission));
  const keyMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  return (
    <AppShell area="seller">
      <div className="min-h-screen bg-[#F5F8FC]">
        <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold text-[#0078E8]">Sales performance</p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#001B44]">Your earnings over time</h1>
              <p className="mt-2 text-sm text-slate-500">Commission earned from confirmed paid sales. Choose a period or set exact dates.</p>
            </div>
            <button onClick={() => void load()} disabled={loading} className="h-10 rounded-lg border border-[#003B95] px-4 text-sm font-semibold text-[#003B95] hover:bg-[#EAF3FF] disabled:opacity-50">
              {loading ? "Refreshing…" : "Refresh data"}
            </button>
          </div>

          <Card className="border border-blue-100 bg-white p-5 shadow-none">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Choose analytics period">
              {([
                ["day", "Day"], ["week", "Week"], ["month", "Month"], ["year", "Year"], ["custom", "Custom dates"],
              ] as [Period, string][]).map(([value, label]) => (
                <button key={value} onClick={() => setPeriod(value)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${period === value ? "bg-[#003B95] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {label}
                </button>
              ))}
            </div>
            {period === "custom" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:max-w-xl">
                <label className="text-sm font-medium text-slate-600">Start date<input type="date" value={startDate} max={endDate || undefined} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-slate-200 px-3 text-slate-800"/></label>
                <label className="text-sm font-medium text-slate-600">End date<input type="date" value={endDate} min={startDate || undefined} max={localDate(new Date())} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block h-10 w-full rounded-lg border border-slate-200 px-3 text-slate-800"/></label>
              </div>
            )}
            <p className="mt-4 text-xs text-slate-500">{range.start.toLocaleDateString("en-ZA")} – {range.end.toLocaleDateString("en-ZA")} · Live data</p>
          </Card>

          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          {loading ? <Card className="p-10 text-center text-sm text-slate-500">Loading sales performance…</Card> : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Paid sales", String(metrics.count)],
                  ["Sales value", formatMoney(metrics.revenue)],
                  ["Commission earned", formatMoney(metrics.commission)],
                  ["Average order", formatMoney(metrics.average)],
                  ["Products sold", String(metrics.products)],
                ].map(([label, value]) => <Card key={label} className="border border-blue-100 bg-white p-5 shadow-none"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-[#003B95]">{value}</p></Card>)}
              </div>

              <Card className="border border-blue-100 bg-white p-5 shadow-none sm:p-7">
                <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div><h2 className="text-lg font-bold text-[#001B44]">Commission earned</h2><p className="mt-1 text-sm text-slate-500">Each bar represents your commission for the selected time bucket.</p></div>
                  <div className="text-left sm:text-right"><p className="text-xs text-slate-500">Total for selected period</p><p className="text-2xl font-bold text-[#003B95]">{formatMoney(metrics.commission)}</p></div>
                </div>
                {chart.every((point) => point.commission === 0) ? <div className="grid min-h-56 place-items-center rounded-xl bg-[#F7FAFF] text-sm text-slate-500">No paid commissions in this period yet.</div> : (
                  <div className="overflow-x-auto">
                    <div className="flex h-64 min-w-[620px] items-end gap-2 border-b border-slate-200 px-2 pt-4">
                      {chart.map((point, index) => (
                        <div key={point.label + index} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
                          <div className="mb-2 text-center text-[10px] font-semibold text-[#003B95] opacity-0 group-hover:opacity-100">{formatMoney(point.commission)}</div>
                          <div title={`${point.label}: ${formatMoney(point.commission)} commission · ${point.sales} sales`} className="mx-auto w-full max-w-12 rounded-t-md bg-[#0078E8] transition hover:bg-[#003B95]" style={{ height: `${Math.max(point.commission > 0 ? 3 : 0, (point.commission / maxCommission) * 72)}%` }} />
                          <p className="mt-2 h-8 overflow-hidden text-center text-[10px] text-slate-500">{chart.length <= 14 || index % Math.ceil(chart.length / 12) === 0 ? point.label : ""}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border border-blue-100 bg-white p-5 shadow-none">
                  <h2 className="font-bold text-[#001B44]">Top products</h2><p className="mt-1 text-sm text-slate-500">Ranked by commission earned in this period.</p>
                  {topProducts.length === 0 ? <p className="py-8 text-sm text-slate-500">No paid sales in this period.</p> : <div className="mt-5 space-y-4">{topProducts.map((product, index) => <div key={product.name + index} className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF3FF] text-sm font-bold text-[#003B95]">{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{product.name}</p><p className="text-xs text-slate-500">{product.sales} paid sales</p></div></div><div className="text-right"><p className="text-sm font-bold text-[#003B95]">{formatMoney(product.commission)}</p><p className="text-xs text-slate-500">commission</p></div></div>)}</div>}
                </Card>
                <Card className="border border-blue-100 bg-white p-5 shadow-none">
                  <h2 className="font-bold text-[#001B44]">Daily breakdown</h2><p className="mt-1 text-sm text-slate-500">Sales and commission included in the selected period.</p>
                  {chart.filter((point) => point.sales > 0).length === 0 ? <p className="py-8 text-sm text-slate-500">No paid sales in this period.</p> : <div className="mt-5 max-h-96 space-y-2 overflow-y-auto">{chart.filter((point) => point.sales > 0).slice().reverse().map((point) => <div key={point.label} className="flex items-center justify-between gap-4 rounded-lg bg-[#F7FAFF] px-4 py-3"><div><p className="text-sm font-semibold text-slate-800">{point.label}</p><p className="text-xs text-slate-500">{point.sales} paid {point.sales === 1 ? "sale" : "sales"} · {formatMoney(point.revenue)} sales value</p></div><p className="shrink-0 text-sm font-bold text-[#003B95]">{formatMoney(point.commission)}</p></div>)}</div>}
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
