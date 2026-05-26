import { API_ORIGIN } from '@/src/services/api/api-client';

export function resolveAttachmentUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

export function getAttachmentLabel(name, url) {
  if (name?.trim()) return name.trim();
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1] || url;
}

export function isPdfAttachment(name, url) {
  const target = `${name || ''} ${url || ''}`.toLowerCase();
  return target.includes('.pdf');
}

export function isImageAttachment(name, url) {
  const target = `${name || ''} ${url || ''}`.toLowerCase();
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(target);
}
