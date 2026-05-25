/**
 * Supported locales — add new entries here and create matching JSON in i18n/locales/
 */
export const LOCALES = [
  { code: 'en', label: 'English', flag: '🇺🇸', flagImage: '/flags/us.png', intl: 'en-US' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', flagImage: '/flags/br.png', intl: 'pt-BR' },
  { code: 'es', label: 'Español', flag: '🇪🇸', flagImage: '/flags/es.png', intl: 'es-ES' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', flagImage: '/flags/fr.png', intl: 'fr-FR' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', flagImage: '/flags/de.png', intl: 'de-DE' },
];

export const DEFAULT_LOCALE = 'en';
export const LOCALE_STORAGE_KEY = 'eb_locale';

export function getLocaleMeta(code) {
  return LOCALES.find((locale) => locale.code === code) || LOCALES[0];
}

export function getIntlLocale(code) {
  return getLocaleMeta(code).intl;
}
