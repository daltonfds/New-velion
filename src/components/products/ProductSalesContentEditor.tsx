"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  beneficios: string[];
  onBeneficiosChange: (value: string[]) => void;
  ingredientes: string;
  onIngredientesChange: (value: string) => void;
  modoUso: string;
  onModoUsoChange: (value: string) => void;
  garantia: string;
  onGarantiaChange: (value: string) => void;
  faq: FaqItem[];
  onFaqChange: (value: FaqItem[]) => void;
  fornecedorNome: string;
  onFornecedorNomeChange: (value: string) => void;
  fornecedorPais: string;
  onFornecedorPaisChange: (value: string) => void;
  fornecedorDescricao: string;
  onFornecedorDescricaoChange: (value: string) => void;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#16294F] focus:ring-2 focus:ring-[#16294F]/10";

const textareaClass =
  "w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#16294F] focus:ring-2 focus:ring-[#16294F]/10";

export default function ProductSalesContentEditor({
  beneficios,
  onBeneficiosChange,
  ingredientes,
  onIngredientesChange,
  modoUso,
  onModoUsoChange,
  garantia,
  onGarantiaChange,
  faq,
  onFaqChange,
  fornecedorNome,
  onFornecedorNomeChange,
  fornecedorPais,
  onFornecedorPaisChange,
  fornecedorDescricao,
  onFornecedorDescricaoChange,
}: Props) {
  const [openSection, setOpenSection] = useState<string>("benefits");

  function toggle(section: string) {
    setOpenSection((current) => (current === section ? "" : section));
  }

  function addBenefit() {
    onBeneficiosChange([...beneficios, ""]);
  }

  function updateBenefit(index: number, value: string) {
    const next = [...beneficios];
    next[index] = value;
    onBeneficiosChange(next);
  }

  function removeBenefit(index: number) {
    onBeneficiosChange(beneficios.filter((_, i) => i !== index));
  }

  function addFaq() {
    onFaqChange([...faq, { question: "", answer: "" }]);
  }

  function updateFaq(
    index: number,
    field: keyof FaqItem,
    value: string,
  ) {
    const next = [...faq];
    next[index] = {
      ...next[index],
      [field]: value,
    };
    onFaqChange(next);
  }

  function removeFaq(index: number) {
    onFaqChange(faq.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#16294F]/10 bg-[#16294F]/[0.03] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16294F] text-sm font-bold text-white">
            ✦
          </div>

          <div>
            <h3 className="font-semibold text-[#16294F]">
              Sales Page Content
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              These sections are displayed automatically on the product sales
              page. Add complete information to give customers a clear view of
              the product before checkout.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => toggle("benefits")}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-slate-900">Benefits</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Add the main benefits customers should see.
            </p>
          </div>

          <span className="text-slate-400">
            {openSection === "benefits" ? "−" : "+"}
          </span>
        </button>

        {openSection === "benefits" && (
          <div className="border-t border-slate-100 p-5">
            <div className="space-y-3">
              {beneficios.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-sm font-semibold text-[#16294F]">
                    {index + 1}
                  </div>

                  <input
                    value={benefit}
                    onChange={(event) =>
                      updateBenefit(index, event.target.value)
                    }
                    placeholder="Example: Supports daily wellness"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove benefit"
                  >
                    ×
                  </button>
                </div>
              ))}

              {beneficios.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 px-5 py-6 text-center text-sm text-slate-400">
                  No benefits added yet.
                </div>
              )}

              <button
                type="button"
                onClick={addBenefit}
                className="rounded-xl border border-[#16294F] px-4 py-2.5 text-sm font-semibold text-[#16294F] hover:bg-[#16294F] hover:text-white"
              >
                + Add benefit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => toggle("ingredients")}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-slate-900">
              Ingredients / Composition
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Explain what the product contains.
            </p>
          </div>

          <span className="text-slate-400">
            {openSection === "ingredients" ? "−" : "+"}
          </span>
        </button>

        {openSection === "ingredients" && (
          <div className="border-t border-slate-100 p-5">
            <textarea
              value={ingredientes}
              onChange={(event) => onIngredientesChange(event.target.value)}
              rows={7}
              placeholder="List ingredients, materials, composition or specifications..."
              className={textareaClass}
            />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => toggle("usage")}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-slate-900">How to Use</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Give customers clear instructions.
            </p>
          </div>

          <span className="text-slate-400">
            {openSection === "usage" ? "−" : "+"}
          </span>
        </button>

        {openSection === "usage" && (
          <div className="border-t border-slate-100 p-5">
            <textarea
              value={modoUso}
              onChange={(event) => onModoUsoChange(event.target.value)}
              rows={7}
              placeholder="Step 1: ...&#10;Step 2: ...&#10;Step 3: ..."
              className={textareaClass}
            />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => toggle("guarantee")}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-slate-900">Guarantee</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Add your refund or guarantee policy.
            </p>
          </div>

          <span className="text-slate-400">
            {openSection === "guarantee" ? "−" : "+"}
          </span>
        </button>

        {openSection === "guarantee" && (
          <div className="border-t border-slate-100 p-5">
            <textarea
              value={garantia}
              onChange={(event) => onGarantiaChange(event.target.value)}
              rows={6}
              placeholder="Example: 30-day money-back guarantee..."
              className={textareaClass}
            />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => toggle("faq")}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-slate-900">
              Frequently Asked Questions
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Build individual question and answer blocks.
            </p>
          </div>

          <span className="text-slate-400">
            {openSection === "faq" ? "−" : "+"}
          </span>
        </button>

        {openSection === "faq" && (
          <div className="border-t border-slate-100 p-5">
            <div className="space-y-4">
              {faq.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#16294F]">
                      Question {index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      value={item.question}
                      onChange={(event) =>
                        updateFaq(index, "question", event.target.value)
                      }
                      placeholder="What is this product used for?"
                      className={inputClass}
                    />

                    <textarea
                      value={item.answer}
                      onChange={(event) =>
                        updateFaq(index, "answer", event.target.value)
                      }
                      rows={4}
                      placeholder="Write the answer..."
                      className={textareaClass}
                    />
                  </div>
                </div>
              ))}

              {faq.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 px-5 py-6 text-center text-sm text-slate-400">
                  No FAQ entries added yet.
                </div>
              )}

              <button
                type="button"
                onClick={addFaq}
                className="rounded-xl border border-[#16294F] px-4 py-2.5 text-sm font-semibold text-[#16294F] hover:bg-[#16294F] hover:text-white"
              >
                + Add FAQ
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => toggle("supplier")}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
        >
          <div>
            <p className="font-semibold text-slate-900">
              Supplier / Producer
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Information shown in the supplier section of the sales page.
            </p>
          </div>

          <span className="text-slate-400">
            {openSection === "supplier" ? "−" : "+"}
          </span>
        </button>

        {openSection === "supplier" && (
          <div className="border-t border-slate-100 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Supplier / Producer Name
                </label>
                <input
                  value={fornecedorNome}
                  onChange={(event) =>
                    onFornecedorNomeChange(event.target.value)
                  }
                  placeholder="Company or producer name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Country
                </label>
                <input
                  value={fornecedorPais}
                  onChange={(event) =>
                    onFornecedorPaisChange(event.target.value)
                  }
                  placeholder="South Africa"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  About the Supplier / Producer
                </label>
                <textarea
                  value={fornecedorDescricao}
                  onChange={(event) =>
                    onFornecedorDescricaoChange(event.target.value)
                  }
                  rows={5}
                  placeholder="Describe the company, production, experience or brand..."
                  className={textareaClass}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-[#16294F]">
          Sales page structure
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Photos",
            "Product name",
            "Price",
            "Benefits",
            "Description",
            "Ingredients",
            "How to use",
            "Guarantee",
            "FAQ",
            "Supplier",
            "Checkout",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
