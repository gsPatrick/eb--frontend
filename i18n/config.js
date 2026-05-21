/**
 * Supported locales — add new entries here and create matching JSON in i18n/locales/
 */
export const LOCALES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷', intl: 'pt-BR' },
  { code: 'en', label: 'English', flag: '🇺🇸', intl: 'en-US' },
  { code: 'es', label: 'Español', flag: '🇪🇸', intl: 'es-ES' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', intl: 'fr-FR' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', intl: 'de-DE' },
];

export const DEFAULT_LOCALE = 'pt';
export const LOCALE_STORAGE_KEY = 'eb_locale';

export function getLocaleMeta(code) {
  return LOCALES.find((locale) => locale.code === code) || LOCALES[0];
}

export function getIntlLocale(code) {
  return getLocaleMeta(code).intl;
}
