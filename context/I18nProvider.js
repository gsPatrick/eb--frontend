'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { getI18nInstance } from '@/i18n';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, getIntlLocale, getLocaleMeta } from '@/i18n/config';

function normalizeLocale(value) {
  if (typeof value === 'string') {
    const code = value.trim().toLowerCase();
    if (getLocaleMeta(code).code === code) return code;
  }

  return DEFAULT_LOCALE;
}

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  intlLocale: getIntlLocale(DEFAULT_LOCALE),
});

function readStoredLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored) return normalizeLocale(stored);

  try {
    const user = JSON.parse(localStorage.getItem('eb_user') || '{}');
    if (user.locale) return normalizeLocale(user.locale);
  } catch {
    // ignore
  }

  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }) {
  const i18n = useMemo(() => getI18nInstance(DEFAULT_LOCALE), []);
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleState(stored);
    i18n.changeLanguage(stored);
    document.documentElement.lang = getIntlLocale(stored);
  }, [i18n]);

  useEffect(() => {
    document.documentElement.lang = getIntlLocale(locale);

    try {
      const saved = localStorage.getItem('eb_user');
      if (saved) {
        const user = JSON.parse(saved);
        localStorage.setItem('eb_user', JSON.stringify({ ...user, locale }));
      }
    } catch {
      // ignore
    }
  }, [locale]);

  const setLocale = (nextLocale) => {
    const safeLocale = normalizeLocale(nextLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, safeLocale);
    setLocaleState(safeLocale);
    i18n.changeLanguage(safeLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, intlLocale: getIntlLocale(locale) }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
