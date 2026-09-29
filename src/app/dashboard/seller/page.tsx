"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase";
import { getWalletSummary } from "@/lib/services/wallet";
import { getSellerFinancialSummary } from "@/lib/services/seller-financials";

type Sale = {
  id: string;
  vendido_em: string;
  status: string | null;
  valor_venda: number | null;
  comissao_vendedor: number | null;
  vendedor_id: string;
  product_id: string;
  product?: {
    nome: string;
    moeda: string;
  } | {
    nome: string;
    moeda: string;
  }[] | null;
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);

export default function SellerDashboardPage() {
  const db = supabase;

  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [wallet, setWallet] = useState({
    disponivel: 0,
    retido: 0,
    reservado: 0,
    saldo_total: 0,
  });
  const [userName, setUserName] = useState("Seller");
  const [financialSummary, setFinancialSummary] = useState<Awaited<ReturnType<typeof getSellerFinancialSummary>> | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await db.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: profile }, { data: salesData }, walletSummary, financialSummary] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("full_name,nome_completo")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("sales")
            .select(
              `id,vendido_em,status,valor_venda,comissao_vendedor,valor_garantia,vendedor_id,product_id`
            )
            .eq("vendedor_id", user.id)
            .order("created_at", { ascending: false }),

          getWalletSummary(user.id),
          getSellerFinancialSummary(user.id),
        ]);

      const name =
        profile?.full_name ||
        profile?.nome_completo ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Seller";

      setUserName(name);
      setSales((salesData || []) as Sale[]);
      setWallet(walletSummary);
      setFinancialSummary(financialSummary);
      setLoading(false);
    }

    load();
  }, []);

  const paidSales = useMemo(
    () =>
      sales.filter((sale) =>
        ["paga", "paid", "approved", "completed", "success"].includes(
          (sale.status || "").toLowerCase()
        )
      ),
    [sales]
  );

  const totalSales = financialSummary?.gross_sales ?? 0;

  const totalCommission = financialSummary?.commission_earned ?? 0;

  const monthly = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - index),
        1
      );

      const monthSales = paidSales.filter((sale) => {
        const saleDate = new Date(sale.vendido_em);
        return (
          saleDate.getFullYear() === date.getFullYear() &&
          saleDate.getMonth() === date.getMonth()
        );
      });

      return {
        month: date.toLocaleDateString("en-US", { month: "short" }),
        sales: monthSales.length,
        commission: monthSales.reduce(
          (sum, sale) => sum + Number(sale.comissao_vendedor || 0),
          0
        ),
      };
    });
  }, [paidSales]);

  const maxCommission = Math.max(
    ...monthly.map((item) => item.commission),
    1
  );

  return (
    <AppShell area="seller">
      <main className="min-h-screen bg-[#F5F8FC]">
        <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-8 lg:py-8">
          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-[#C99A2E]">
                Seller dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#16294F]">
                Welcome back, {userName}
              </h1>
              <p className="mt-2 text-sm text-[#60708A]">
                Monitor your affiliate business, commissions and wallet in one
                place.
              </p>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#16294F] px-5 text-sm font-semibold text-white transition hover:bg-[#203A68]"
            >
              Browse marketplace
            </Link>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Available balance",
                value: money(wallet.disponivel),
                note: "Ready for withdrawal",
                accent: "bg-[#EAF7F0] text-[#18794E]",
              },
              {
                label: "Pending balance",
                value: money(wallet.retido),
                note: "Guarantee currently retained",
                accent: "bg-[#FFF7E5] text-[#9A7018]",
              },
              {
                label: "Total sales",
                value: (financialSummary?.sales_count ?? 0).toString(),
                note: "Paid sales",
                accent: "bg-[#EDF4FF] text-[#245EA8]",
              },
              {
                label: "Total commission",
                value: money(totalCommission),
                note: "Commission from paid sales",
                accent: "bg-[#F0EDFA] text-[#5E4A98]",
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="border-[#DCE3EE] bg-white p-5 shadow-none"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-[#60708A]">
                    {item.label}
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.accent.split(" ")[0]}`}
                  />
                </div>

                <div className="mt-5 text-2xl font-semibold tracking-[-0.025em] text-[#16294F]">
                  {loading ? "—" : item.value}
                </div>

                <p className="mt-1 text-xs text-[#7C8798]">{item.note}</p>
              </Card>
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-base font-semibold text-[#16294F]">
                    Sales performance
                  </h2>
                  <p className="mt-1 text-sm text-[#7C8798]">
                    Commission generated from paid sales over the last six
                    months.
                  </p>
                </div>

                <span className="rounded-md border border-[#DCE3EE] bg-[#F8FAFD] px-3 py-1.5 text-xs font-medium text-[#60708A]">
                  Live data
                </span>
              </div>

              <div className="mt-8 h-64">
                <div className="flex h-full items-end gap-3 sm:gap-5">
                  {monthly.map((item) => {
                    const height =
                      item.commission === 0
                        ? 4
                        : Math.max(
                            8,
                            (item.commission / maxCommission) * 100
                          );

                    return (
                      <div
                        key={item.month}
                        className="flex h-full flex-1 flex-col justify-end"
                      >
                        <div className="mb-2 text-center text-[11px] font-medium text-[#60708A]">
                          {item.commission > 0
                            ? money(item.commission)
                            : "R 0,00"}
                        </div>

                        <div className="flex h-[185px] items-end">
                          <div
                            className="w-full rounded-t-md bg-[#2B5F9E] transition-all"
                            style={{ height: `${height}%` }}
                            title={`${item.month}: ${money(
                              item.commission
                            )}`}
                          />
                        </div>

                        <div className="mt-3 text-center text-xs font-medium text-[#7C8798]">
                          {item.month}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <div>
                <h2 className="text-base font-semibold text-[#16294F]">
                  Wallet position
                </h2>
                <p className="mt-1 text-sm text-[#7C8798]">
                  Current allocation of your account balance.
                </p>
              </div>

              <div className="mt-8 space-y-5">
                {[
                  ["Available", wallet.disponivel, "bg-[#2B5F9E]"],
                  ["Retained", wallet.retido, "bg-[#C99A2E]"],
                  ["Reserved", wallet.reservado, "bg-[#8A8570]"],
                ].map(([label, value, color]) => {
                  const total =
                    wallet.disponivel + wallet.retido + wallet.reservado;

                  const percent =
                    total > 0 ? (Number(value) / total) * 100 : 0;

                  return (
                    <div key={String(label)}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-[#405579]">
                          {label}
                        </span>
                        <span className="text-[#16294F]">
                          {money(Number(value))}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#E9EEF5]">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-[#E9EEF5] pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#60708A]">Total balance</span>
                  <span className="text-lg font-semibold text-[#16294F]">
                    {money(
                      wallet.disponivel + wallet.retido + wallet.reservado
                    )}
                  </span>
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <p className="text-sm font-medium text-[#60708A]">
                Sales revenue
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#16294F]">
                {money(totalSales)}
              </p>
              <p className="mt-1 text-xs text-[#7C8798]">
                From paid affiliate sales
              </p>
            </Card>

            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <p className="text-sm font-medium text-[#60708A]">
                Commission earned
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#16294F]">
                {money(totalCommission)}
              </p>
              <p className="mt-1 text-xs text-[#7C8798]">
                Confirmed commission
              </p>
            </Card>

            <Card className="border-[#DCE3EE] bg-white p-6 shadow-none">
              <p className="text-sm font-medium text-[#60708A]">
                Paid conversions
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#16294F]">
                {financialSummary?.sales_count ?? 0}
              </p>
              <p className="mt-1 text-xs text-[#7C8798]">
                Successfully completed sales
              </p>
            </Card>
          </section>

          <section className="mt-6">
            <Card className="overflow-hidden border-[#DCE3EE] bg-white p-0 shadow-none">
              <div className="flex flex-col justify-between gap-3 border-b border-[#E9EEF5] px-6 py-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-semibold text-[#16294F]">
                    Recent sales
                  </h2>
                  <p className="mt-1 text-sm text-[#7C8798]">
                    Latest transactions recorded for your account.
                  </p>
                </div>

                <Link
                  href="/dashboard/seller/sales"
                  className="text-sm font-semibold text-[#245EA8] hover:underline"
                >
                  View all sales
                </Link>
              </div>

              {loading ? (
                <div className="px-6 py-10 text-sm text-[#7C8798]">
                  Loading live records…
                </div>
              ) : paidSales.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-[#DCE3EE] bg-[#F5F8FC]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5 text-[#60708A]"
                    >
                      <path d="M4 19V5M4 19h16M8 15v-3M12 15V8M16 15v-6" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#16294F]">
                    No paid sales yet
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-[#7C8798]">
                    Once your affiliate links generate confirmed sales, your
                    performance will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F8FAFD] text-xs uppercase tracking-wide text-[#7C8798]">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Sale value</th>
                        <th className="px-6 py-3 font-medium">Commission</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9EEF5]">
                      {paidSales.slice(0, 6).map((sale) => (
                        <tr key={sale.id} className="hover:bg-[#FAFBFD]">
                          <td className="px-6 py-4 text-[#60708A]">
                            {new Date(sale.vendido_em).toLocaleDateString(
                              "en-GB"
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#16294F]">
                            {money(Number(sale.valor_venda || 0))}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#18794E]">
                            {money(Number(sale.comissao_vendedor || 0))}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-[#EAF7F0] px-2.5 py-1 text-xs font-medium text-[#18794E]">
                              Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
