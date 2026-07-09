"use client";

import { useLocale } from "@/lib/i18n/context";
import { LOCALES, type Locale } from "@/lib/i18n/types";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))]">
      <label className="sr-only" htmlFor="language-select">
        {t("language")}
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
      >
        {LOCALES.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
