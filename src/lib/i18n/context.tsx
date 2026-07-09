"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translations } from "./translations";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALE_TAGS,
  type Locale,
  type TranslationKey,
} from "./types";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  localeTag: string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);

  if (stored === "el" || stored === "en" || stored === "bg" || stored === "mk" || stored === "sr") {
    return stored;
  }

  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALE_TAGS[locale];
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const messages = translations[locale];

    return {
      locale,
      setLocale,
      localeTag: LOCALE_TAGS[locale],
      t: (key: TranslationKey) => messages[key],
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}

export function useTranslations() {
  const { locale, t, localeTag } = useLocale();
  const messages = translations[locale];

  return { locale, t, localeTag, services: messages.services };
}
