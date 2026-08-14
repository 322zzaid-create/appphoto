/* App service worker (Capacitor only).
 * The bundled app is served from a local origin, so top-level navigations to
 * "/api/*" (the final ad-gated download redirect) are forwarded to the real
 * deployment. Everything else is left to the network untouched.
 */
const APP_URL = 'https://apexfiy-app.vercel.app';

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    const target = new URL(url.pathname + url.search, APP_URL);
    event.respondWith(fetch(target, { method: 'GET', redirect: 'follow', mode: 'cors', credentials: 'omit' }));
  }
});
