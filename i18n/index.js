import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE } from './config';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import landingDe from './locales/landing/de.json';
import landingEn from './locales/landing/en.json';
import landingEs from './locales/landing/es.json';
import landingFr from './locales/landing/fr.json';
import landingPt from './locales/landing/pt.json';

const resources = {
  pt: { translation: { ...pt, landing: landingPt } },
  en: { translation: { ...en, landing: landingEn } },
  es: { translation: { ...es, landing: landingEs } },
  fr: { translation: { ...fr, landing: landingFr } },
  de: { translation: { ...de, landing: landingDe } },
};

let sharedInstance = null;

export function getI18nInstance(initialLocale = DEFAULT_LOCALE) {
  if (sharedInstance) {
    if (sharedInstance.language !== initialLocale) {
      sharedInstance.changeLanguage(initialLocale);
    }
    return sharedInstance;
  }

  sharedInstance = i18n.createInstance();
  sharedInstance.use(initReactI18next).init({
    resources,
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initImmediate: false,
  });

  return sharedInstance;
}

export default sharedInstance;
