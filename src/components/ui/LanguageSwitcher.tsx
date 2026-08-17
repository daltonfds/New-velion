"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button onClick={toggleLanguage} className="p-2 text-muted hover:text-dark transition-colors flex items-center gap-1 text-sm">
      <Globe size={18} />
      <span className="uppercase font-medium">{language}</span>
    </button>
  );
}
