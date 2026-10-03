"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FaqItem = {
  question: string;
  answer: string;
};

type Product = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  moeda: string;
  fotos: string[];
  checkout_url: string | null;
  ativo: boolean;
  beneficios: string[];
  ingredientes: string | null;
  modo_uso: string | null;
  garantia_texto: string | null;
  faq: FaqItem[];
  fornecedor_nome: string | null;
  fornecedor_descricao: string | null;
  fornecedor_pais: string | null;
  avaliacao_media: number;
  total_avaliacoes: number;
  video_url: string | null;
};

type Review = {
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  verified_buyer: boolean;
};

export default function SalesPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const productId = String(params.id || "");
  const ref = searchParams.get("ref") || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setError("Produto não encontrado.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: productError } = await supabase
        .from("products")
        .select(
          "id,nome,descricao,preco,preco_promocional,moeda,fotos,checkout_url,ativo,beneficios,ingredientes,modo_uso,garantia_texto,faq,fornecedor_nome,fornecedor_descricao,fornecedor_pais,avaliacao_media,total_avaliacoes,video_url"
        )
        .eq("id", productId)
        .eq("ativo", true)
        .maybeSingle();

      if (productError) {
        console.error(productError);
        setError("Não foi possível carregar este produto.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Produto não encontrado ou indisponível.");
        setLoading(false);
        return;
      }

      setProduct(data as Product);

      const { data: reviewData } = await supabase
        .from("product_reviews")
        .select("reviewer_name,rating,review_text,verified_buyer")
        .eq("product_id", productId)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);

      setReviews((reviewData || []) as Review[]);
      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  const mainImage = useMemo(() => {
    return product?.fotos?.[0] || "";
  }, [product]);

  const price = product?.preco_promocional ?? product?.preco ?? 0;
  const oldPrice =
    product?.preco_promocional && product.preco_promocional < product.preco
      ? product.preco
      : null;

  const discount = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  const currency = product?.moeda || "USD";

  function money(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function checkoutUrl() {
    if (!product?.checkout_url) return "";

    try {
      const url = new URL(product.checkout_url);

      if (ref) {
        url.searchParams.set("ref", ref);
        url.searchParams.set("affiliate", ref);
      }

      return url.toString();
    } catch {
      return product.checkout_url;
    }
  }

  async function submitCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!product) return;

    if (!product.checkout_url) {
      alert("O checkout deste produto ainda não está configurado.");
      return;
    }

    if (ref) {
      const form = event.currentTarget;
      const formData = new FormData(form);

      try {
        await fetch("/api/checkout-intents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: product.id,
            affiliate_link: ref,
            customer_name: formData.get("name"),
            customer_email: formData.get("email"),
            customer_phone: formData.get("phone"),
          }),
        });
      } catch (checkoutError) {
        console.error(checkoutError);
      }
    }

    window.location.href = checkoutUrl();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#16294F]" />
          <p className="text-sm text-slate-500">Carregando produto...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-3 text-2xl font-bold text-[#16294F]">
            Produto indisponível
          </h1>
          <p className="text-slate-500">
            {error || "Este produto não está disponível neste momento."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-xl font-bold tracking-tight text-[#16294F]">
              Newvelion
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A8570]">
              Commerce infrastructure
            </div>
          </div>

          {ref && (
            <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              Partner offer
            </div>
          )}
        </div>
      </header>

      <main className="min-h-screen bg-white pb-24 text-[#111827]">
        <section className="border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.nome}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                {product.fotos.length > 1 && (
                  <div className="mt-4 grid grid-cols-5 gap-3">
                    {product.fotos.slice(0, 5).map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={image}
                          alt={`${product.nome} ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-24">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#C99A2E]">
                  Newvelion marketplace
                </p>

                <h1 className="text-3xl font-bold leading-tight text-[#16294F] sm:text-4xl lg:text-5xl">
                  {product.nome}
                </h1>

                {product.avaliacao_media > 0 && (
                  <div className="mt-5 flex items-center gap-2">
                    <span className="text-[#C99A2E]">
                      {"★".repeat(Math.min(5, Math.round(product.avaliacao_media)))}
                    </span>
                    <span className="text-sm text-slate-500">
                      {product.avaliacao_media.toFixed(1)}
                      {product.total_avaliacoes > 0 &&
                        ` (${product.total_avaliacoes} avaliações)`}
                    </span>
                  </div>
                )}

                <div className="mt-7 border-y border-slate-200 py-6">
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-[#16294F]">
                      {money(price)}
                    </span>

                    {oldPrice && (
                      <span className="pb-1 text-lg text-slate-400 line-through">
                        {money(oldPrice)}
                      </span>
                    )}

                    {discount > 0 && (
                      <span className="rounded-full bg-[#16294F] px-3 py-1 text-xs font-bold text-white">
                        -{discount}%
                      </span>
                    )}
                  </div>
                </div>

                {product.beneficios?.length > 0 && (
                  <div className="mt-7">
                    <h2 className="mb-4 text-lg font-bold text-[#16294F]">
                      Principais benefícios
                    </h2>

                    <ul className="space-y-3">
                      {product.beneficios.map((benefit, index) => (
                        <li
                          key={`${benefit}-${index}`}
                          className="flex gap-3 text-sm leading-6 text-slate-600"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16294F] text-xs text-white">
                            ✓
                          </span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <form onSubmit={submitCheckout} className="space-y-3">
                    {ref && (
                      <>
                        <input
                          required
                          name="name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nome completo"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                        />

                        <input
                          required
                          type="email"
                          name="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="Email"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                        />

                        <input
                          name="phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Telefone"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#16294F]"
                        />
                      </>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#16294F] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#243b67]"
                    >
                      Comprar agora
                    </button>
                  </form>

                  <p className="mt-3 text-center text-xs text-slate-400">
                    Compra segura através do checkout disponibilizado pelo
                    fornecedor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {product.descricao && (
          <section className="border-b border-slate-100">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <h2 className="mb-6 text-2xl font-bold text-[#16294F]">
                Sobre este produto
              </h2>

              <div className="whitespace-pre-line text-base leading-8 text-slate-600">
                {product.descricao}
              </div>
            </div>
          </section>
        )}

        {product.ingredientes && (
          <section className="border-b border-slate-100 bg-[#f8fafc]">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <h2 className="mb-5 text-2xl font-bold text-[#16294F]">
                Ingredientes e composição
              </h2>

              <p className="whitespace-pre-line text-base leading-8 text-slate-600">
                {product.ingredientes}
              </p>
            </div>
          </section>
        )}

        {product.modo_uso && (
          <section className="border-b border-slate-100">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <h2 className="mb-5 text-2xl font-bold text-[#16294F]">
                Como usar
              </h2>

              <p className="whitespace-pre-line text-base leading-8 text-slate-600">
                {product.modo_uso}
              </p>
            </div>
          </section>
        )}

        {product.video_url && (
          <section className="border-b border-slate-100 bg-[#f8fafc]">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
              <h2 className="mb-6 text-2xl font-bold text-[#16294F]">
                Conheça o produto
              </h2>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black">
                <video
                  src={product.video_url}
                  controls
                  className="max-h-[600px] w-full"
                />
              </div>
            </div>
          </section>
        )}

        {reviews.length > 0 && (
          <section className="border-b border-slate-100">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#16294F]">
                  Avaliações de clientes
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Experiências publicadas por compradores.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review, index) => (
                  <article
                    key={`${review.reviewer_name}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="mb-3 text-[#C99A2E]">
                      {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
                    </div>

                    <p className="text-sm leading-7 text-slate-600">
                      “{review.review_text}”
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#16294F]">
                        {review.reviewer_name || "Cliente"}
                      </span>

                      {review.verified_buyer && (
                        <span className="text-xs font-medium text-slate-400">
                          Compra verificada
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {product.garantia_texto && (
          <section className="border-b border-slate-100 bg-[#f8fafc]">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16294F] text-white">
                    ✓
                  </div>

                  <h2 className="text-2xl font-bold text-[#16294F]">
                    Garantia
                  </h2>
                </div>

                <p className="whitespace-pre-line text-base leading-8 text-slate-600">
                  {product.garantia_texto}
                </p>
              </div>
            </div>
          </section>
        )}

        {product.faq?.length > 0 && (
          <section className="border-b border-slate-100">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <h2 className="mb-8 text-2xl font-bold text-[#16294F]">
                Perguntas frequentes
              </h2>

              <div className="space-y-4">
                {product.faq.map((item, index) => (
                  <details
                    key={`${item.question}-${index}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <summary className="cursor-pointer list-none font-semibold text-[#16294F]">
                      {item.question}
                    </summary>

                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {(product.fornecedor_nome ||
          product.fornecedor_descricao ||
          product.fornecedor_pais) && (
          <section className="border-b border-slate-100 bg-[#f8fafc]">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <h2 className="mb-6 text-2xl font-bold text-[#16294F]">
                Sobre o fornecedor
              </h2>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                {product.fornecedor_nome && (
                  <h3 className="text-lg font-bold text-[#16294F]">
                    {product.fornecedor_nome}
                  </h3>
                )}

                {product.fornecedor_pais && (
                  <p className="mt-1 text-sm text-slate-400">
                    {product.fornecedor_pais}
                  </p>
                )}

                {product.fornecedor_descricao && (
                  <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {product.fornecedor_descricao}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="border-t border-slate-100 bg-[#f8fafc]">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 teext-center sm:p-10">
              <h2 className="text-2xl font-bold text-[#16294F]">
                Pronto para comprar?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Finalize sua compra através do checkout disponibilizado para
                este produto.
              </p>

              <a
                href={checkoutUrl() || "#"}
                onClick={(event) => {
                  if (!product.checkout_url) {
                    event.preventDefault();
                    alert("O checkout deste produto ainda não está configurado.");
                  }
                }}
                className="mt-7 inline-flex rounded-xl bg-[#16294F] px-8 py-4 text-sm font-bold text-white"
              >
                Comprar agora
              </a>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-3 md:hidden">
        <a
          href={checkoutUrl() || "#"}
          onClick={(event) => {
            if (!product.checkout_url) {
              event.preventDefault();
              alert("O checkout deste produto ainda não está configurado.");
            }
          }}
          className="block w-full rounded-xl bg-[#16294F] px-6 py-4 text-center text-sm font-bold text-white"
        >
          Comprar agora · {money(price)}
        </a>
      </div>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <div>
            <div className="font-bold text-[#16294F]">Newvelion</div>
            <div className="text-xs text-[#8A8570]">
              Commerce infrastructure
            </div>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Newvelion. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
