const CACHE_NAME = 'llmjs-cache';
const urlsToCache = [
        'https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf',
        './'
];

// Install event - caching files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - cleaning up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/* Fetch event - serving cached content
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});


//doing an experiment.....
self.addEventListener('fetch', (event) => { try {
  event.respondWith((async () => {
    const response = await fetch(event.request);
    const headers = response.headers;
    headers.append('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.append('Cross-Origin-Opener-Policy', 'same-origin');
    return new Response(response.body, {
      headers: headers
    });
  })());
} catch (error) {
event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
  alert('service-worker.js error!');
}
});

*/



self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);

      // Create a new Headers object and copy existing headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
      newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('Fetch failed; falling back to cache:', error);

      // Fallback to cache or fetch the request
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      } else {
        console.warn('No cached response found, attempting network fetch...');
        return fetch(event.request).catch((fetchError) => {
          console.error('Network fetch failed:', fetchError);
          return new Response('An error occurred.', {
            status: 500,
            statusText: 'Internal Server Error',
          });
        });
      }
    }
  })());
});






// Update event - refresh every file besides the qwen2 model
self.addEventListener('message', (event) => {
  if (event.data.action === 'updateCache') {
          
  const dingus = './';
  // Remove the directory from the cache
  caches.open(CACHE_NAME).then((cache) => {
    cache.keys().then((keys) => {
      keys.forEach((request) => {
        if (request.url.includes(dingus)) {
          cache.delete(request);
        }
      });
      // Re-cache the directory
      fetch(dingus).then((response) => {
        if (response.ok) {
          cache.put(dingus, response);
        }
      }).catch((error) => {
        console.error('Failed to re-cache the goofy little dingus:', error);
      });
    });
  });
          
  }
});
