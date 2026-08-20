"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

const countries = [
  { name: "Mozambique", dial_code: "+258", code: "MZ", flag: "🇲🇿" },
  { name: "South Africa", dial_code: "+27", code: "ZA", flag: "🇿🇦" },
  { name: "Angola", dial_code: "+244", code: "AO", flag: "🇦🇴" },
  { name: "Afghanistan", dial_code: "+93", code: "AF", flag: "🇦🇫" },
  { name: "Albania", dial_code: "+355", code: "AL", flag: "🇦🇱" },
  { name: "Algeria", dial_code: "+213", code: "DZ", flag: "🇩🇿" },
  { name: "Argentina", dial_code: "+54", code: "AR", flag: "🇦🇷" },
  { name: "Australia", dial_code: "+61", code: "AU", flag: "🇦🇺" },
  { name: "Austria", dial_code: "+43", code: "AT", flag: "🇦🇹" },
  { name: "Belgium", dial_code: "+32", code: "BE", flag: "🇧🇪" },
  { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
  { name: "Canada", dial_code: "+1", code: "CA", flag: "🇨🇦" },
  { name: "China", dial_code: "+86", code: "CN", flag: "🇨🇳" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "India", dial_code: "+91", code: "IN", flag: "🇮🇳" },
  { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
  { name: "Japan", dial_code: "+81", code: "JP", flag: "🇯🇵" },
  { name: "Kenya", dial_code: "+254", code: "KE", flag: "🇰🇪" },
  { name: "Mexico", dial_code: "+52", code: "MX", flag: "🇲🇽" },
  { name: "Nigeria", dial_code: "+234", code: "NG", flag: "🇳🇬" },
  { name: "Portugal", dial_code: "+351", code: "PT", flag: "🇵🇹" },
  { name: "Russia", dial_code: "+7", code: "RU", flag: "🇷🇺" },
  { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
  { name: "Tanzania", dial_code: "+255", code: "TZ", flag: "🇹🇿" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "Zambia", dial_code: "+260", code: "ZM", flag: "🇿🇲" },
  { name: "Zimbabwe", dial_code: "+263", code: "ZW", flag: "🇿🇼" }
];

interface CountrySelectorProps {
  onSelect: (country: { name: string; dial_code: string; code: string; flag: string }) => void;
  selectedCountry?: string;
}

export default function CountrySelector({ onSelect, selectedCountry }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.dial_code.includes(search)
  );

  const selected = countries.find((c) => c.code === selectedCountry);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-secondary/50 border border-light-border rounded-lg text-light-text focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span>{selected.flag}</span>
              <span>{selected.dial_code}</span>
            </>
          ) : (
            <span className="text-light-muted text-sm">Select Country</span>
          )}
        </span>
        <ChevronDown size={16} className={`text-light-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-light-border rounded-lg shadow-lg z-50 max-h-64 flex flex-col">
          <div className="p-2 border-b border-light-border flex items-center gap-2">
            <Search size={16} className="text-light-muted" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-light-text"
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onSelect(country);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-light-text hover:bg-secondary/50 rounded-md transition-colors text-left"
                >
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-light-muted ml-auto">{country.dial_code}</span>
                </button>
              ))
            ) : (
              <p className="p-3 text-center text-sm text-light-muted">No countries found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
