"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProductImageUploader from "@/components/products/ProductImageUploader";
import ProductSalesContentEditor from "@/components/products/ProductSalesContentEditor";
import { supabase } from "@/lib/supabase";
import { notify } from "@/lib/notify";

interface InitialReviewDraft {
  reviewer_name: string;
  email: string;
  rating: number;
  review_text: string;
  review_date: string;
  files: File[];
}

interface Category {
  id: string;
  nome: string;
  parent_id: string | null;
  ordem: number;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialReviews, setInitialReviews] = useState<InitialReviewDraft[]>([]);

  const [form, setForm] = useState({
    nome: "",
    slug: "",
    descricao: "",
    beneficios: "",
    ingredientes: "",
    modo_uso: "",
    garantia_texto: "",
    faq: "",
    fornecedor_nome: "",
    fornecedor_descricao: "",
    fornecedor_pais: "",
    categoria_id: "",
    preco: "",
    preco_promocional: "",
    moeda: "ZAR",
    comissao_tipo: "percentual",
    comissao_valor: "",
    pricing_mode: "fixed",
    custom_pricing_floor_zar: "",
    fotos: [] as string[],
    video_url: "",
    checkout_url: "",
    estoque: "0",
    ativo: false,
    destaque: false,
    novo: true,
  });

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("id, nome, parent_id, ordem")
        .order("ordem", { ascending: true });

      setCategories(data ?? []);
    }

    void loadCategories();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create a product.");
      setSaving(false);
      return;
    }

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

    if (initialReviews.some((review) => !review.reviewer_name.trim() || review.review_text.trim().length < 3 || review.files.length > 4)) {
      setError("Cada depoimento inicial precisa de nome e comentário (mínimo de 3 caracteres), com até 4 ficheiros.");
      setSaving(false);
      return;
    }

    const { data: createdProduct, error: insertError } = await supabase.from("products").insert({
      nome: form.nome.trim(),
      slug: form.slug.trim() || generateSlug(form.nome),
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
        ? Number(form.preco_promocional)
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
      created_by: user.id,
    }).select("id").single();

    if (insertError) {
      setError(insertError.message);
      notify.error("Falha ao criar produto", insertError.message);
      setSaving(false);
      return;
    }

    if (createdProduct?.id && initialReviews.length) {
      const { data: { session } } = await supabase.auth.getSession();
      for (const review of initialReviews) {
        const mediaUrls: string[] = [];
        for (const file of review.files.slice(0, 4)) {
          const upload = new FormData();
          upload.set("action", "upload");
          upload.set("product_id", createdProduct.id);
          upload.set("file", file);
          const uploadResponse = await fetch("/api/dashboard/product-reviews", {
            method: "POST",
            headers: { Authorization: "Bearer " + (session?.access_token || "") },
            body: upload,
          });
          const uploadBody = await uploadResponse.json().catch(() => ({}));
          if (!uploadResponse.ok) {
            setError("Produto criado, mas a mídia de um depoimento não foi enviada: " + (uploadBody.error || "erro de upload"));
            setSaving(false);
            router.push("/dashboard/admin/products/" + createdProduct.id);
            return;
          }
          mediaUrls.push(uploadBody.url);
        }
        const payload = new FormData();
        payload.set("action", "create");
        payload.set("product_id", createdProduct.id);
        payload.set("reviewer_name", review.reviewer_name);
        payload.set("email", review.email);
        payload.set("rating", String(review.rating));
        payload.set("review_text", review.review_text);
        payload.set("review_date", new Date((review.review_date || new Date().toISOString().slice(0, 10)) + "T12:00:00").toISOString());
        payload.set("media_urls", JSON.stringify(mediaUrls));
        const reviewResponse = await fetch("/api/dashboard/product-reviews", {
          method: "POST",
          headers: { Authorization: "Bearer " + (session?.access_token || "") },
          body: payload,
        });
        const reviewBody = await reviewResponse.json().catch(() => ({}));
        if (!reviewResponse.ok) {
          setError("Produto criado, mas um depoimento não foi guardado: " + (reviewBody.error || "erro ao guardar"));
          setSaving(false);
          router.push("/dashboard/admin/products/" + createdProduct.id);
          return;
        }
      }
    }

    notify.success(
      "Produto criado",
      initialReviews.length
        ? "Produto e depoimentos iniciais guardados com sucesso."
        : "O produto foi criado com sucesso."
    );

    router.push("/dashboard/admin/products");
    router.refresh();
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
            Add Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a product that sellers can promote through the Newvelion
            marketplace.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(event) => {
                    const value = event.target.value;
                    updateField("nome", value);

                    if (!form.slug) {
                      updateField("slug", generateSlug(value));
                    }
                  }}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <Input
                label="Slug"
                value={form.slug}
                onChange={(event) =>
                  updateField("slug", generateSlug(event.target.value))
                }
                placeholder="product-slug"
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
                  placeholder="Describe the product..."
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
                      `${item.question}
${item.answer}`,
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
                placeholder="0.00"
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
                placeholder="Optional"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Seller Pricing Model
                </label>
                <select
                  value={form.pricing_mode}
                  onChange={(event) => updateField("pricing_mode", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none"
                >
                  <option value="fixed">Fixed Offer — Admin/Supplier controls price</option>
                  <option value="custom">Custom Pricing — Seller/Platform controls price</option>
                </select>
              </div>

              {form.pricing_mode === "custom" && (
                <Input
                  label="Custom Pricing Base (ZAR)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.custom_pricing_floor_zar}
                  onChange={(event) => updateField("custom_pricing_floor_zar", event.target.value)}
                  placeholder="Minimum allowed selling price"
                />
              )}

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
                placeholder="0"
                required
              />
            </div>
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
                onChange={(fotos) => setForm((current) => ({ ...current, fotos }))}
                disabled={saving}
              />

              <Input
                label="Video URL"
                type="url"
                value={form.video_url}
                onChange={(event) =>
                  updateField("video_url", event.target.value)
                }
                placeholder="https://..."
              />

              <Input
                label="Checkout URL"
                type="url"
                value={form.checkout_url}
                onChange={(event) =>
                  updateField("checkout_url", event.target.value)
                }
                placeholder="https://..."
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">Depoimentos Iniciais (Opcional)</h2>
                <p className="mt-1 text-sm text-slate-500">Depoimentos adicionados manualmente são publicados como não verificados.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setInitialReviews(items => [...items, { reviewer_name: "", email: "", rating: 5, review_text: "", review_date: new Date().toISOString().slice(0, 10), files: [] }])}>+ Adicionar depoimento</Button>
            </div>
            <div className="space-y-5 p-6">
              {initialReviews.length === 0 ? <p className="text-sm text-slate-500">Nenhum depoimento inicial adicionado.</p> : initialReviews.map((review, index) => <div key={index} className="space-y-4 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between"><h3 className="font-medium text-slate-900">Depoimento {index + 1}</h3><button type="button" onClick={() => setInitialReviews(items => items.filter((_, i) => i !== index))} className="text-sm text-red-600">Remover</button></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nome do cliente" value={review.reviewer_name} onChange={e => setInitialReviews(items => items.map((item,i) => i===index ? {...item,reviewer_name:e.target.value} : item))} required />
                  <Input label="E-mail (opcional)" type="email" value={review.email} onChange={e => setInitialReviews(items => items.map((item,i) => i===index ? {...item,email:e.target.value} : item))} />
                  <label className="text-sm font-medium text-slate-700">Nota / Estrelas<select value={review.rating} onChange={e => setInitialReviews(items => items.map((item,i) => i===index ? {...item,rating:Number(e.target.value)} : item))} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} {n===1?"estrela":"estrelas"}</option>)}</select></label>
                  <Input label="Data da avaliação" type="date" value={review.review_date} onChange={e => setInitialReviews(items => items.map((item,i) => i===index ? {...item,review_date:e.target.value} : item))} />
                  <label className="text-sm font-medium text-slate-700 sm:col-span-2">Texto da avaliação<textarea required minLength={3} maxLength={5000} rows={3} value={review.review_text} onChange={e => setInitialReviews(items => items.map((item,i) => i===index ? {...item,review_text:e.target.value} : item))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
                  <label className="text-sm font-medium text-slate-700 sm:col-span-2">Fotos ou vídeos (opcional; até 4 ficheiros de 4 MB cada)<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={e => setInitialReviews(items => items.map((item,i) => i===index ? {...item,files:Array.from(e.target.files || []).slice(0,4)} : item))} className="mt-1.5 block w-full text-sm" /></label>
                </div>
              </div>)}
            </div>
          </Card>

          <Card>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">
                Marketplace Visibility
              </h2>
            </div>

            <div className="space-y-4 p-6">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(event) =>
                    updateField("ativo", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    Active
                  </span>
                  <span className="block text-xs text-slate-500">
                    Make this product visible in the marketplace.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.destaque}
                  onChange={(event) =>
                    updateField("destaque", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    Featured
                  </span>
                  <span className="block text-xs text-slate-500">
                    Highlight this product in marketplace listings.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.novo}
                  onChange={(event) =>
                    updateField("novo", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    New Product
                  </span>
                  <span className="block text-xs text-slate-500">
                    Display the new-product indicator.
                  </span>
                </span>
              </label>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/admin/products">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>

            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
