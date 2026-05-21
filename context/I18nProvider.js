'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { getI18nInstance } from '@/i18n';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, getIntlLocale } from '@/i18n/config';

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  intlLocale: getIntlLocale(DEFAULT_LOCALE),
});

function readStoredLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored) return stored;

  try {
    const user = JSON.parse(localStorage.getItem('eb_user') || '{}');
    if (user.locale) return user.locale;
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
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    setLocaleState(nextLocale);
    i18n.changeLanguage(nextLocale);
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
