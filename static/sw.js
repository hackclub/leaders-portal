const CACHE_NAME = 'leaders-portal-v1';
const STATIC_ASSETS = [
  '/',
  '/my-club',
  '/events',
  '/tools',
  '/ysws'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Check if a request should be handled by the service worker
function shouldHandleRequest(request) {
  const url = new URL(request.url);
  
  // Only handle http/https requests
  if (!url.protocol.startsWith('http')) return false;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return false;
  
  // Skip API requests - always go to network
  if (url.pathname.includes('/api/')) return false;
  
  // Skip browser extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') return false;
  
  // Skip external requests (not from our origin)
  if (url.origin !== self.location.origin) return false;
  
  return true;
}

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip requests we shouldn't handle
  if (!shouldHandleRequest(event.request)) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response before caching
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
