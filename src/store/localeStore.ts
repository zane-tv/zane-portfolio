"use client";

import { useEffect } from "react";
import { create } from "zustand";

export type Locale = "en" | "vi";

interface LocaleState {
  locale: Locale;
  hydrated: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  hydrateLocale: () => void;
}

const STORAGE_KEY = "zane-portfolio-locale-v2";

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: "en",
  hydrated: false,

  setLocale: (locale) => {
    set({ locale });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        // Ignore storage quota errors
      }
      document.documentElement.lang = locale;
    }
  },

  toggleLocale: () => {
    const next: Locale = get().locale === "en" ? "vi" : "en";
    get().setLocale(next);
  },

  hydrateLocale: () => {
    if (get().hydrated || typeof window === "undefined") return;
    let saved: Locale = "en";
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "en" || raw === "vi") {
        saved = raw;
      }
    } catch {
      saved = "en";
    }
    document.documentElement.lang = saved;
    set({ locale: saved, hydrated: true });
  },
}));

export function LocaleHydrator() {
  const hydrateLocale = useLocaleStore((s) => s.hydrateLocale);
  useEffect(() => {
    hydrateLocale();
  }, [hydrateLocale]);
  return null;
}
