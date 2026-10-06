"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProductImageUploader from "@/components/products/ProductImageUploader";
import ProductSalesContentEditor from "@/components/products/ProductSalesContentEditor";
import { supabase } from "@/lib/supabase";
import { notify } from "@/lib/notify";

interface ProductForm {
  nome: string;
  slug: string;
  descricao: string;
  beneficios: string;
  ingredientes: string;
  modo_uso: string;
  garantia_texto: string;
  faq: string;
  fornecedor_nome: string;
  fornecedor_descricao: string;
  fornecedor_pais: string;
  categoria_id: string;
  preco: string;
  preco_promocional: string;
  moeda: string;
  comissao_tipo: string;
  comissao_valor: string;
  pricing_mode: string;
  custom_pricing_floor_zar: string;
  fotos: string[];
  video_url: string;
  checkout_url: string;
  estoque: string;
  ativo: boolean;
  destaque: boolean;
  novo: boolean;
}

interface Category {
  id: string;
  nome: string;
  parent_id: string | null;
  ordem: number;
}

export default function AdminProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [form, setForm] = useState<ProductForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      const [productResult, categoriesResult] = await Promise.all([
        supabase.from("products").select("*").eq("id", productId).single(),
        supabase
          .from("categories")
          .select("id, nome, parent_id, ordem")
          .order("ordem", { ascending: true }),
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (productResult.error) {
        setError(productResult.error.message);
        setLoading(false);
        return;
      }

      const product = productResult.data;

      setForm({
        nome: product.nome ?? "",
        slug: product.slug ?? "",
        descricao: product.descricao ?? "",
        beneficios: Array.isArray(product.beneficios)
          ? product.beneficios.join("\n")
          : "",
        ingredientes: product.ingredientes ?? "",
        modo_uso: product.modo_uso ?? "",
        garantia_texto: product.garantia_texto ?? "",
        faq: Array.isArray(product.faq)
          ? product.faq
              .map((item: { question?: string; answer?: string }) =>
                `${item.question ?? ""}\n${item.answer ?? ""}`)
              .join("\n\n")
          : "",
        fornecedor_nome: product.fornecedor_nome ?? "",
        fornecedor_descricao: product.fornecedor_descricao ?? "",
        fornecedor_pais: product.fornecedor_pais ?? "",
        categoria_id: product.categoria_id ?? "",
        preco: String(product.preco ?? ""),
        preco_promocional:
          product.preco_promocional == null
            ? ""
            : String(product.preco_promocional),
        moeda: product.moeda ?? "ZAR",
        comissao_tipo: product.comissao_tipo ?? "percentual",
        comissao_valor: String(product.comissao_valor ?? ""),
        pricing_mode: product.pricing_mode ?? "fixed",
        custom_pricing_floor_zar: product.custom_pricing_floor_zar == null ? "" : String(product.custom_pricing_floor_zar),
        fotos: Array.isArray(product.fotos) ? product.fotos : [],
        video_url: product.video_url ?? "",
        checkout_url: product.checkout_url ?? "",
        estoque: String(product.estoque ?? 0),
        ativo: Boolean(product.ativo),
        destaque: Boolean(product.destaque),
        novo: Boolean(product.novo),
      });

      setLoading(false);
    }

    void load();
  }, [productId]);

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) {
    setForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );

    setSuccess("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) return;

    setSaving(true);
    setError("");
    setSuccess("");

    if (!form.nome.trim()) {
      setError("Product name is required.");
      setSaving(false);
      return;
    }

    if (!form.preco || Number(form.preco) < 0) {
      setError("A valid product price is required.");
      setSaving(false);
      return;
    }

    if (!form.checkout_url.startsWith("http://") &&
        !form.checkout_url.startsWith("https://")) {
      setError("A valid checkout URL is required.");
      setSaving(false);
      return;
    }

    if (form.fotos.length === 0) {
      setError("At least one product image is required.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        nome: form.nome.trim(),
        slug: form.slug.trim(),
        descricao: form.descricao.trim(),
      beneficios: form.beneficios
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      ingredientes: form.ingredientes.trim() || null,
      modo_uso: form.modo_uso.trim() || null,
      garantia_texto: form.garantia_texto.trim() || null,
      faq: form.faq
        .split(/\n\s*\n/)
        .map((block) => {
          const lines = block
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          if (lines.length < 2) return null;

          return {
            question: lines[0],
            answer: lines.slice(1).join(" "),
          };
        })
        .filter(Boolean),
      fornecedor_nome: form.fornecedor_nome.trim() || null,
      fornecedor_descricao: form.fornecedor_descricao.trim() || null,
      fornecedor_pais: form.fornecedor_pais.trim() || null,
        categoria_id: form.categoria_id || null,
        subcategoria_id: subcategoriaId || null,
        preco: form.moeda === "ZAR" ? Math.round(Number(form.preco)) : Number(form.preco),
        preco_promocional: form.preco_promocional
          ? form.moeda === "ZAR"
            ? Math.round(Number(form.preco_promocional))
            : Number(form.preco_promocional)
          : null,
        moeda: form.moeda,
        comissao_tipo: form.comissao_tipo,
        comissao_valor: Number(form.comissao_valor || 0),
        pricing_mode: form.pricing_mode === "custom" ? "custom" : "fixed",
        custom_pricing_floor_zar: form.pricing_mode === "custom" && form.custom_pricing_floor_zar ? Number(form.custom_pricing_floor_zar) : null,
        fotos: form.fotos,
        video_url: form.video_url.trim() || null,
        checkout_url: form.checkout_url.trim(),
        estoque: Number(form.estoque || 0),
        ativo: form.ativo,
        destaque: form.destaque,
        novo: form.novo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (updateError) {
      setError(updateError.message);
      notify.error("Falha ao atualizar produto", updateError.message);
      setSaving(false);
      return;
    }

    notify.success(
      "Produto atualizado",
      "As alterações foram salvas com sucesso."
    );

    setSuccess("Product updated successfully.");
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this product? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      setError(deleteError.message);
      notify.error("Falha ao excluir produto", deleteError.message);
      setDeleting(false);
      return;
    }

    notify.success(
      "Produto excluído",
      "O produto foi excluído com sucesso."
    );

    router.push("/dashboard/admin/products");
    router.refresh();
  }

  if (loading) {
    return (
      <AppShell area="admin">
        <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
          Loading product...
        </div>
      </AppShell>
    );
  }

  if (!form) {
    return (
      <AppShell area="admin">
        <div className="mx-auto max-w-3xl">
          <Card>
            <div className="p-8 text-center">
              <h1 className="text-xl font-semibold text-slate-900">
                Product not found
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {error || "This product does not exist."}
              </p>
              <div className="mt-6">
                <Link href="/dashboard/admin/products">
                  <Button>Back to Products</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell area="admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link
            href="/dashboard/admin/products"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Products
          </Link>

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Manage Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update product information, pricing, commission and marketplace
            visibility.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Basic Information
              </h2>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Product Name"
                  value={form.nome}
                  onChange={(event) =>
                    updateField("nome", event.target.value)
                  }
                  required
                />
              </div>

              <Input
                label="Slug"
                value={form.slug}
                onChange={(event) =>
                  updateField("slug", event.target.value)
                }
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category
                </label>

                <select
                  value={form.categoria_id}
                  onChange={(event) =>
                    updateField("categoria_id", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.descricao}
                  onChange={(event) =>
                    updateField("descricao", event.target.value)
                  }
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </Card>

          <ProductSalesContentEditor
            beneficios={form.beneficios
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)}
            onBeneficiosChange={(items) =>
              updateField("beneficios", items.join("\n"))
            }
            ingredientes={form.ingredientes}
            onIngredientesChange={(value) =>
              updateField("ingredientes", value)
            }
            modoUso={form.modo_uso}
            onModoUsoChange={(value) =>
              updateField("modo_uso", value)
            }
            garantia={form.garantia_texto}
            onGarantiaChange={(value) =>
              updateField("garantia_texto", value)
            }
            faq={form.faq
              .split(/\n\s*\n/)
              .map((block) => {
                const lines = block
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean);

                return {
                  question: lines[0] || "",
                  answer: lines.slice(1).join(" "),
                };
              })
              .filter((item) => item.question || item.answer)}
            onFaqChange={(items) =>
              updateField(
                "faq",
                items
                  .map(
                    (item) =>
                      `${item.question}\n${item.answer}`,
                  )
                  .join("\n\n"),
              )
            }
            fornecedorNome={form.fornecedor_nome}
            onFornecedorNomeChange={(value) =>
              updateField("fornecedor_nome", value)
            }
            fornecedorPais={form.fornecedor_pais}
            onFornecedorPaisChange={(value) =>
              updateField("fornecedor_pais", value)
            }
            fornecedorDescricao={form.fornecedor_descricao}
            onFornecedorDescricaoChange={(value) =>
              updateField("fornecedor_descricao", value)
            }
          />


          <Card>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Pricing & Commission
              </h2>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <Input
                label="Price"
                type="number"
                min="0"
                step="0.01"
                value={form.preco}
                onChange={(event) =>
                  updateField("preco", event.target.value)
                }
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Currency
                </label>

                <select
                  value={form.moeda}
                  onChange={(event) =>
                    updateField("moeda", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="ZAR">ZAR</option>
                </select>
              </div>

              <Input
                label="Promotional Price"
                type="number"
                min="0"
                step="0.01"
                value={form.preco_promocional}
                onChange={(event) =>
                  updateField("preco_promocional", event.target.value)
                }
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Commission Type
                </label>

                <select
                  value={form.comissao_tipo}
                  onChange={(event) =>
                    updateField("comissao_tipo", event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="percentual">Percentage</option>
                  <option value="fixo">Fixed Amount</option>
                </select>
              </div>

              <Input
                label="Commission Value"
                type="number"
                min="0"
                step="0.01"
                value={form.comissao_valor}
                onChange={(event) =>
                  updateField("comissao_valor", event.target.value)
                }
                required
              />
 

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Seller Pricing Model</label>
                <select value={form.pricing_mode} onChange={(event) => updateField("pricing_mode", event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                  <option value="fixed">Fixed Offer — supplier controls price</option>
                  <option value="custom">Custom Pricing — seller chooses price</option>
                </select>
              </div>

              {form.pricing_mode === "custom" && (
                <Input label="Custom Pricing Base (ZAR)" type="number" min="0" step="0.01" value={form.custom_pricing_floor_zar} onChange={(event) => updateField("custom_pricing_floor_zar", event.target.value)} required />
              )}           </div>
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Media & Checkout
              </h2>
            </div>

            <div className="grid gap-5 p-6">
              <ProductImageUploader
                value={form.fotos}
                onChange={(fotos) => updateField("fotos", fotos)}
                disabled={saving}
              />

              <Input
                label="Video URL"
                type="url"
                value={form.video_url}
                onChange={(event) =>
                  updateField("video_url", event.target.value)
                }
              />

              <Input
                label="Checkout URL"
                type="url"
                value={form.checkout_url}
                onChange={(event) =>
                  updateField("checkout_url", event.target.value)
                }
                required
              />

              <Input
                label="Stock"
                type="number"
                min="0"
                value={form.estoque}
                onChange={(event) =>
                  updateField("estoque", event.target.value)
                }
              />
            </div>
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Marketplace Visibility
              </h2>
            </div>

            <div className="space-y-4 p-6">
              {[
                {
                  key: "ativo" as const,
                  title: "Active",
                  description: "Make this product visible in the marketplace.",
                },
                {
                  key: "destaque" as const,
                  title: "Featured",
                  description: "Highlight this product in marketplace listings.",
                },
                {
                  key: "novo" as const,
                  title: "New Product",
                  description: "Display the new-product indicator.",
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={form[item.key]}
                    onChange={(event) =>
                      updateField(item.key, event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      {item.title}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {item.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </Button>

            <div className="flex gap-3">
              <Link href="/dashboard/admin/products">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
