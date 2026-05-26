export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const FINANCIAL_LOCALE = 'en-US';
export const FINANCIAL_CURRENCY = 'USD';

export function formatCurrency(
  value,
  locale = FINANCIAL_LOCALE,
  currency = FINANCIAL_CURRENCY
) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value || 0);
}

export function formatDate(value, locale = 'pt-BR') {
  if (!value) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value, locale = 'pt-BR') {
  if (!value) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatRelativeTime(value, locale = 'pt-BR') {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return formatDate(value, locale);
}

export function truncate(text, max = 40) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
