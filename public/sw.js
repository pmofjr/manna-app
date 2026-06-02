const CACHE_NAME = 'manna-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim())
})

self.addEventListener('fetch', (e) => {
  // Apenas cacheia recursos estáticos
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request)
    })
  )
})
