"use client";

import { useState, useRef, useEffect } from "react";
import { countries } from "@/lib/countries";
import { ChevronDown, Search } from "lucide-react";

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
        className="w-full flex items-center justify-between px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span>{selected.flag}</span>
              <span>{selected.dial_code}</span>
            </>
          ) : (
            <span className="text-muted text-sm">Select Country</span>
          )}
        </span>
        <ChevronDown size={16} className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-border rounded-lg shadow-lg z-50 max-h-64 flex flex-col">
          <div className="p-2 border-b border-border flex items-center gap-2">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-dark"
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
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark hover:bg-secondary/50 rounded-md transition-colors text-left"
                >
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-muted ml-auto">{country.dial_code}</span>
                </button>
              ))
            ) : (
              <p className="p-3 text-center text-sm text-muted">No countries found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
