/**
 * Website-wide configuration.
 *
 * VITE_APP_URL points to the hosted StartupOS application portal.
 * In development, defaults to the local portal server (port 3000).
 */
export const APP_URL =
  (import.meta.env.VITE_APP_URL) ?? 'http://localhost:3000';

/**
 * Build an absolute URL to the app portal view — e.g. appUrl('?view=portal&tab=academy')
 */
export function appUrl(params = '') {
  const base = APP_URL.replace(/\/$/, '');
  if (!params) return `${base}/?view=portal`;
  return `${base}/${params.startsWith('?') || params.startsWith('/') ? params : `/${params}`}`;
}
