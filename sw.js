importScripts('serviceworker-cache-polyfill.js');

var CACHE_NAME = 'my-site-cache-v1';

var urlsToCache = [
  '/',
  '/test/'
];

self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
          .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
          })
      );
});

self.addEventListener('fetch', function(event) {
  console.log('started event', event);
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }

        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            console.log('Cached from', response);
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
              	console.log('putting in cache', event.request, responseToCache)
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});