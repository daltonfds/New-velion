"use client";

import { COUNTRIES, getCountry } from "@/lib/countries";

type Props = {
  countryCode: string;
  phone: string;
  whatsapp: string;
  language: "en" | "pt";
  onCountryChange: (country: string, callingCode: string) => void;
  onPhoneChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onLanguageChange: (value: "en" | "pt") => void;
};

export default function PhoneFields({
  countryCode,
  phone,
  whatsapp,
  language,
  onCountryChange,
  onPhoneChange,
  onWhatsappChange,
  onLanguageChange,
}: Props) {
  const country = getCountry(countryCode);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#16294F]">
          Country
        </label>

        <select
          required
          value={countryCode}
          onChange={(event) => {
            const selected = getCountry(event.target.value);

            onCountryChange(
              event.target.value,
              selected?.callingCode || "",
            );
          }}
          className="w-full rounded-xl border border-[#16294F]/15 bg-white px-4 py-3.5 outline-none focus:border-[#16294F]"
        >
          <option value="">Select your country</option>

          {COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} ({item.callingCode})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#16294F]">
          Mobile number
        </label>

        <div className="flex gap-2">
          <span className="flex w-24 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold">
            {country?.callingCode || "+—"}
          </span>

          <input
            required
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            inputMode="tel"
            placeholder="72 295 8915"
            className="min-w-0 flex-1 rounded-xl border border-[#16294F]/15 bg-white px-4 py-3.5 outline-none focus:border-[#16294F]"
          />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          The country calling code is synchronized automatically.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#16294F]">
          WhatsApp{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>

        <div className="flex gap-2">
          <span className="flex w-24 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold">
            {country?.callingCode || "+—"}
          </span>

          <input
            value={whatsapp}
            onChange={(event) => onWhatsappChange(event.target.value)}
            inputMode="tel"
            placeholder="Optional WhatsApp number"
            className="min-w-0 flex-1 rounded-xl border border-[#16294F]/15 bg-white px-4 py-3.5 outline-none focus:border-[#16294F]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-[#16294F]">
          Preferred language
        </label>

        <div className="grid grid-cols-2 gap-2">
          {(["en", "pt"] as const).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => onLanguageChange(value)}
              className={
                language === value
                  ? "rounded-xl border border-[#16294F] bg-[#16294F] px-4 py-3 text-sm font-semibold text-white"
                  : "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#16294F]"
              }
            >
              {value === "en" ? "English" : "Português"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
