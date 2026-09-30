"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";

type Sale = {
  id: string;
  vendedor_id: string;
  product_id: string;
  valor_venda: number;
  taxa_gateway: number;
  valor_garantia: number;
  comissao_vendedor: number;
  status: string;
  gateway_ref: string;
  vendido_em: string;
  garantia_libera_em: string;
  product?: {
    nome: string;
    fotos: string[] | null;
  } | null;
};

function money(value: number, currency = "ZAR") {
  return `${Number(value).toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function AdminSalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [currencies, setCurrencies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [error, setError] = useState("");

  async function loadSales() {
    setLoading(true);
    setError("");

    const { data, error: salesError } = await supabase
      .from("sales")
      .select(`
        id,
        vendedor_id,
        product_id,
        valor_venda,
        taxa_gateway,
        valor_garantia,
        comissao_vendedor,
        status,
        gateway_ref,
        vendido_em,
        garantia_libera_em,
        products (
          nome,
          fotos
        )
      `)
      .order("vendido_em", { ascending: false });

    if (salesError) {
      setError(salesError.message);
      setSales([]);
      setLoading(false);
      return;
    }

    const normalized = ((data || []) as any[]).map((row) => ({
      ...row,
      product: Array.isArray(row.products)
        ? row.products[0] || null
        : row.products || null,
    }));

    setSales(normalized as Sale[]);

    const productIds = normalized.map((sale) => sale.product_id);

    if (productIds.length) {
      const { data: products } = await supabase
        .from("products")
        .select("id,moeda")
        .in("id", productIds);

      const map: Record<string, string> = {};

      (products || []).forEach((product) => {
        map[product.id] = product.moeda || "ZAR";
      });

      setCurrencies(map);
    } else {
      setCurrencies({});
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSales();
  }, []);

  const stats = useMemo(() => {
    const paid = sales.filter((sale) => sale.status === "paga");

    return {
      count: paid.length,
      revenue: paid.reduce(
        (sum, sale) => sum + Number(sale.valor_venda),
        0
      ),
      commission: paid.reduce(
        (sum, sale) => sum + Number(sale.comissao_vendedor),
        0
      ),
      guarantee: paid.reduce(
        (sum, sale) => sum + Number(sale.valor_garantia),
        0
      ),
    };
  }, [sales]);

  return (
    <AppShell area="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Commerce
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Sales
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Confirmed sales recorded by NewVelion after payment verification.
            </p>
          </div>

          <button
            type="button"
            onClick={loadSales}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Confirmed sales</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {loading ? "—" : stats.count.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Gross sales</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {loading ? "—" : money(stats.revenue)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Seller commissions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {loading ? "—" : money(stats.commission)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Guarantee retained</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {loading ? "—" : money(stats.guarantee)}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <div className="p-8 text-sm text-slate-500">
              Loading sales...
            </div>
          ) : sales.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-slate-800">
                No sales recorded yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Approved checkout sessions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Product
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Seller
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Sale
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Commission
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Guarantee
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sales.map((sale) => {
                    const currency =
                      currencies[sale.product_id] || "ZAR";

                    return (
                      <tr
                        key={sale.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {sale.product?.nome || "Product"}
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-slate-400">
                            {sale.product_id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-mono text-xs text-slate-700">
                            {sale.vendedor_id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {money(Number(sale.valor_venda), currency)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {money(
                              Number(sale.comissao_vendedor),
                              currency
                            )}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Gross seller commission
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {money(
                            Number(sale.valor_garantia),
                            currency
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {sale.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-500">
                          {new Date(sale.vendido_em).toLocaleString()}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelected(sale)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Sale
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {selected.product?.nome || "Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {[
                ["Sale ID", selected.id],
                ["Gateway reference", selected.gateway_ref],
                ["Seller ID", selected.vendedor_id],
                ["Product ID", selected.product_id],
                [
                  "Sale amount",
                  money(
                    Number(selected.valor_venda),
                    currencies[selected.product_id] || "ZAR"
                  ),
                ],
                [
                  "Gateway fee",
                  money(
                    Number(selected.taxa_gateway),
                    currencies[selected.product_id] || "ZAR"
                  ),
                ],
                [
                  "Gross seller commission",
                  money(
                    Number(selected.comissao_vendedor),
                    currencies[selected.product_id] || "ZAR"
                  ),
                ],
                [
                  "Guarantee retained",
                  money(
                    Number(selected.valor_garantia),
                    currencies[selected.product_id] || "ZAR"
                  ),
                ],
                [
                  "Seller available",
                  money(
                    Number(selected.comissao_vendedor) -
                      Number(selected.valor_garantia),
                    currencies[selected.product_id] || "ZAR"
                  ),
                ],
                [
                  "Sold at",
                  new Date(selected.vendido_em).toLocaleString(),
                ],
                [
                  "Guarantee release",
                  new Date(
                    selected.garantia_libera_em
                  ).toLocaleString(),
                ],
                ["Status", selected.status],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
