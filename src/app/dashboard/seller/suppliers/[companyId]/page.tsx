"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  getSupplierMessages,
  getSupplierProfile,
  sendSupplierMessage,
  type SupplierProfileResponse,
} from "@/lib/newvelion-api";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function pretty(value?: string | null) {
  return value ? value.replace(/_/g, " ") : "—";
}

export default function SupplierProfilePage() {
  const params = useParams<{ companyId: string }>();
  const companyId = params?.companyId;

  const [profile, setProfile] = useState<SupplierProfileResponse | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!companyId) return;

    setLoading(true);
    setError("");

    try {
      const data = await getSupplierProfile(companyId);
      setProfile(data);

      const chat = await getSupplierMessages(companyId);
      setMessages(chat?.messages || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load supplier profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [companyId]);

  async function handleSend() {
    if (!companyId || !message.trim()) return;

    setSending(true);

    try {
      const result = await sendSupplierMessage(companyId, message.trim());

      setMessages((current) => [
        ...current,
        result?.data?.message,
      ].filter(Boolean));

      setMessage("");
    } catch (err) {
      console.error(err);
      setError("Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-8 w-40 rounded-lg bg-gray-200" />
          <div className="h-56 rounded-3xl bg-white" />
          <div className="h-64 rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F7F8FC] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-400" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Supplier not found
          </h1>

          <Link
            href="/dashboard/seller/products"
            className="mt-5 inline-flex rounded-xl bg-[#3B2FE0] px-5 py-3 text-sm font-bold text-white"
          >
            Back to My Products
          </Link>
        </div>
      </main>
    );
  }

  const { company, contact, verification, certifications, products } = profile;

  const verified = ["verified", "approved"].includes(
    String(company.verification_status || "").toLowerCase()
  );

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">

        <Link
          href="/dashboard/seller/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#3B2FE0]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Products
        </Link>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gray-100">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.company_name || "Supplier"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-gray-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-[#1A1A2E]">
                    {company.company_name || "Supplier"}
                  </h1>

                  {verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      <ShieldCheck className="h-4 w-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold capitalize text-amber-700">
                      {pretty(company.verification_status || "pending")}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {company.country_code === "ZA" ? "🇿🇦" : "🌍"}{" "}
                  {company.country_name || "Country unavailable"}
                  {company.city ? ` · ${company.city}` : ""}
                  {company.state_region ? ` · ${company.state_region}` : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold capitalize text-gray-700">
                    {pretty(company.company_type || "supplier")}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Joined {formatDate(company.created_at)}
                  </span>
                </div>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B2FE0] px-5 py-3 text-sm font-bold text-white hover:bg-[#3125C4]"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Supplier
              </a>

            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#3B2FE0]" />
              <h2 className="text-lg font-bold text-gray-900">
                Company Information
              </h2>
            </div>

            {company.description && (
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {company.description}
              </p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              {company.legal_name && (
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">Legal name</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {company.legal_name}
                  </p>
                </div>
              )}

              {company.registration_number && (
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-400">
                    Registration number
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {company.registration_number}
                  </p>
                </div>
              )}

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-gray-50 p-4 hover:bg-gray-100"
                >
                  <p className="text-xs text-gray-400">Website</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#3B2FE0]">
                    <Globe className="h-4 w-4" />
                    Visit website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </p>
                </a>
              )}

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">Location</p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <MapPin className="h-4 w-4" />
                  {company.city || "—"}
                  {company.state_region ? `, ${company.state_region}` : ""}
                </p>
              </div>
            </div>

            {contact && (
              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Primary contact
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white">
                    {contact.avatar_url ? (
                      <img
                        src={contact.avatar_url}
                        alt={contact.full_name || "Contact"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {contact.full_name || "Company contact"}
                    </p>
                    <p className="text-xs capitalize text-gray-500">
                      {contact.job_title || "Company representative"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#3B2FE0]" />
              <h2 className="text-lg font-bold text-gray-900">
                Verification
              </h2>
            </div>

            <div className="mt-5 space-y-3">

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Business verification
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold capitalize text-gray-900">
                  {verified ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                  )}
                  {pretty(verification.status || "pending")}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  KYC / identity verification
                </p>
                <p className="mt-1 text-sm font-bold capitalize text-gray-900">
                  {pretty(verification.kyc_status)}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Verification date
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatDate(
                    verification.verified_at || verification.reviewed_at
                  )}
                </p>
              </div>

            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-[#3B2FE0]" />

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Certifications
              </h2>
              <p className="text-sm text-gray-500">
                Public certifications supplied by the company.
              </p>
            </div>
          </div>

          {certifications.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {certifications.map((certificate) => (
                <div
                  key={certificate.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {certificate.name}
                      </p>

                      {certificate.issuer && (
                        <p className="mt-1 text-sm text-gray-500">
                          {certificate.issuer}
                        </p>
                      )}
                    </div>

                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  </div>

                  {certificate.certificate_number && (
                    <p className="mt-3 text-xs text-gray-500">
                      Certificate:{" "}
                      <span className="font-semibold text-gray-700">
                        {certificate.certificate_number}
                      </span>
                    </p>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    Issued: {formatDate(certificate.issued_at)} · Expires:{" "}
                    {formatDate(certificate.expires_at)}
                  </p>

                  {certificate.description && (
                    <p className="mt-3 text-sm leading-5 text-gray-600">
                      {certificate.description}
                    </p>
                  )}

                  {certificate.document_url && (
                    <a
                      href={certificate.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3B2FE0] hover:underline"
                    >
                      View certificate
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No public certifications have been added.
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Products
              </h2>
              <p className="text-sm text-gray-500">
                {products.length} active products published by this supplier.
              </p>
            </div>

            <Package className="h-5 w-5 text-gray-400" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={
                  product.slug
                    ? `/marketplace/products/${product.slug}`
                    : "/marketplace"
                }
                className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
              >
                <div className="h-40 bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name_en || product.name_pt || "Product"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-bold text-gray-900">
                    {product.name_en || product.name_pt || "Product"}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900">
                      {product.currency || "ZAR"}{" "}
                      {Number(product.price || 0).toLocaleString()}
                    </span>

                    <span className="font-bold text-emerald-600">
                      {Number(product.commission_percentage || 0)}%
                    </span>
                  </div>

                  <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                    {product.status || "active"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#3B2FE0]" />

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Contact Supplier
              </h2>
              <p className="text-sm text-gray-500">
                Start and continue conversations inside NewVelion.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {messages.length ? (
                messages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white p-3 shadow-sm"
                  >
                    <p className="text-sm text-gray-700">
                      {item.body}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-400">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">
                  No messages yet. Start the conversation below.
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Write a message to this supplier..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#3B2FE0]"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3B2FE0] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">

            {company.business_email && (
              <a
                href={`mailto:${company.business_email}`}
                className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 hover:bg-gray-100"
              >
                <Mail className="h-5 w-5 text-[#3B2FE0]" />

                <div>
                  <p className="text-xs text-gray-400">
                    Business email
                  </p>
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {company.business_email}
                  </p>
                </div>
              </a>
            )}

            {company.business_phone_e164 || company.business_phone ? (
              <a
                href={`tel:${company.business_phone_e164 || company.business_phone}`}
                className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 hover:bg-gray-100"
              >
                <Phone className="h-5 w-5 text-[#3B2FE0]" />

                <div>
                  <p className="text-xs text-gray-400">
                    Business phone
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {company.business_phone_e164 || company.business_phone}
                  </p>
                </div>
              </a>
            ) : null}

            {company.whatsapp_e164 || company.whatsapp_number ? (
              <a
                href={`https://wa.me/${String(
                  company.whatsapp_e164 || company.whatsapp_number
                ).replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 hover:bg-gray-100"
              >
                <MessageCircle className="h-5 w-5 text-[#3B2FE0]" />

                <div>
                  <p className="text-xs text-gray-400">
                    WhatsApp
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {company.whatsapp_e164 || company.whatsapp_number}
                  </p>
                </div>
              </a>
            ) : null}

          </div>
        </section>

      </div>
    </main>
  );
}
