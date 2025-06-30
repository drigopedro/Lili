// Service Worker for PWA functionality
const CACHE_NAME = 'lili-nutrition-v1';
const STATIC_CACHE = 'lili-static-v1';
const DYNAMIC_CACHE = 'lili-dynamic-v1';
const API_CACHE = 'lili-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Lili-logo.png',
  '/offline.html',
  'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/recipes',
  '/api/meal-plans',
  '/api/user-profile'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      networkFirstStrategy(request, API_CACHE)
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(
      cacheFirstStrategy(request, STATIC_CACHE)
    );
    return;
  }

  // Handle navigation requests with network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstStrategy(request, DYNAMIC_CACHE)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Default strategy for other requests
  event.respondWith(
    networkFirstStrategy(request, DYNAMIC_CACHE)
  );
});

// Network-first caching strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch from network:', error);
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'meal-plan-sync') {
    event.waitUntil(syncMealPlans());
  }
  
  if (event.tag === 'recipe-save-sync') {
    event.waitUntil(syncSavedRecipes());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New meal plan ready!',
    icon: '/Lili-logo.png',
    badge: '/Lili-logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Meal Plan',
        icon: '/Lili-logo.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Lili Nutrition', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Sync functions
async function syncMealPlans() {
  try {
    // Get pending meal plan updates from IndexedDB
    const pendingUpdates = await getPendingMealPlanUpdates();
    
    for (const update of pendingUpdates) {
      await fetch('/api/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update)
      });
    }
    
    // Clear pending updates after successful sync
    await clearPendingMealPlanUpdates();
  } catch (error) {
    console.error('Failed to sync meal plans:', error);
  }
}

async function syncSavedRecipes() {
  try {
    // Get pending recipe saves from IndexedDB
    const pendingRecipes = await getPendingSavedRecipes();
    
    for (const recipe of pendingRecipes) {
      await fetch('/api/saved-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe)
      });
    }
    
    // Clear pending saves after successful sync
    await clearPendingSavedRecipes();
  } catch (error) {
    console.error('Failed to sync saved recipes:', error);
  }
}

// IndexedDB helper functions (simplified)
async function getPendingMealPlanUpdates() {
  // Implementation would use IndexedDB to get pending updates
  return [];
}

async function clearPendingMealPlanUpdates() {
  // Implementation would clear IndexedDB pending updates
}

async function getPendingSavedRecipes() {
  // Implementation would use IndexedDB to get pending saves
  return [];
}

async function clearPendingSavedRecipes() {
  // Implementation would clear IndexedDB pending saves
}