const CACHE_NAME = 'flashcard-master-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// نصب سرویس ورکر و کش فایل‌ها
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// استراتژی Cache First با fallback به Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // اگر در کش موجود باشد، برگردان
        if (response) {
          return response;
        }
        // در غیر این صورت درخواست به شبکه
        return fetch(event.request)
          .then(response => {
            // بررسی اینکه پاسخ معتبر باشد
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // clone پاسخ برای ذخیره در کش
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// فعال‌سازی و پاکسازی کش‌های قدیمی
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
