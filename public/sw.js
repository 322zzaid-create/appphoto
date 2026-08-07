const CACHE_VERSION = 'wallhub-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const IMAGE_CACHE = `${CACHE_VERSION}-images`
const API_CACHE = `${CACHE_VERSION}-api`
const OFFLINE_PAGE = '/offline'

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== STATIC_CACHE && key !== IMAGE_CACHE && key !== API_CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  if (url.pathname === '/offline') {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)))
    return
  }

  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
})

function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          cache.put(request, clone)
        }
        return response
      })
    })
  )
}

function networkFirst(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          cache.put(request, clone)
        }
        return response
      })
      .catch(() =>
        cache.match(request).then((cached) => cached || caches.match(OFFLINE_PAGE) || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }))
      )
  )
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            cache.put(request, clone)
          }
          return response
        })
        .catch(() => cached)

      return cached || networkFetch
    })
  )
}

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Wallpaper Hub', body: event.data.text() }
  }

  const options = {
    body: data.body || 'New wallpapers available!',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-96.svg',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Wallpaper Hub', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      return self.clients.openWindow(targetUrl)
    })
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'download-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SYNC_DOWNLOADS' }))
      })
    )
  }
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'wallpaper-refresh') {
    event.waitUntil(
      caches.open(API_CACHE).then((cache) => cache.delete(new Request('/api/wallpapers/featured')))
    )
  }
})
