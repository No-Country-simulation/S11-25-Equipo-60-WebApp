# 📴 Funcionalidad Offline - Datos sin Conexión a Internet

## 📋 Índice
- [Introducción](#introducción)
- [Arquitectura Offline-First](#arquitectura-offline-first)
- [Service Workers](#service-workers)
- [Estrategias de Cache](#estrategias-de-cache)
- [IndexedDB para Datos Offline](#indexeddb-para-datos-offline)
- [Sincronización en Background](#sincronización-en-background)
- [PWA (Progressive Web App)](#pwa-progressive-web-app)
- [Implementación Completa](#implementación-completa)
- [Detección de Conexión](#detección-de-conexión)

---

## 🎯 Introducción

### ¿Por qué funcionalidad offline?

**Ventajas:**
- ✅ App funciona sin internet
- ✅ Mejor experiencia de usuario
- ✅ Reduce errores de red
- ✅ Aumenta engagement
- ✅ Soporta redes lentas

**Casos de uso:**
- 📱 Apps móviles
- ✈️ Modo avión
- 📶 Zonas con mala señal
- 💼 Trabajo en campo
- 🚇 Metro/transporte público

---

## 🏗️ Arquitectura Offline-First

```
┌────────────────────────────────────────────────┐
│              UI Components                     │
└───────────────────┬────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────┐
│         Service Worker                         │
│  - Intercepta requests                         │
│  - Decide: Cache o Network                     │
│  - Maneja errores de red                       │
└───────────┬────────────────┬───────────────────┘
            │                │
    ┌───────▼──────┐  ┌─────▼──────────┐
    │ Cache API    │  │  IndexedDB     │
    │ (Assets)     │  │  (Datos)       │
    └──────────────┘  └────────────────┘
            │                │
            │    ┌───────────▼────────────┐
            └────►  Network (API)         │
                 └────────────────────────┘
```

### Estrategia:

1. **Usuario hace acción** → Guardar en IndexedDB inmediatamente
2. **UI se actualiza** → Feedback instantáneo
3. **Background** → Intentar sincronizar con backend
4. **Sin conexión** → Marcar como "pendiente de sync"
5. **Vuelve conexión** → Sincronizar automáticamente

---

## ⚙️ Service Workers

### ¿Qué es un Service Worker?

Un script que se ejecuta en background y puede interceptar requests de red, cachear recursos y funcionar como proxy entre tu app y la red.

### PASO 1: Crear Service Worker

```javascript
// public/sw.js

const CACHE_NAME = 'testimonial-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/login',
  '/dashboard',
  '/offline',
  '/manifest.json',
  // Agregar rutas críticas
];

// Instalación: Cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  
  // Activar inmediatamente
  self.skipWaiting();
});

// Activación: Limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  // Tomar control inmediatamente
  return self.clients.claim();
});

// Fetch: Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests de chrome-extension, etc.
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Estrategia basada en el tipo de recurso
  if (request.method === 'GET') {
    if (isAPIRequest(url)) {
      // API: Network First
      event.respondWith(networkFirst(request));
    } else if (isStaticAsset(url)) {
      // Assets: Cache First
      event.respondWith(cacheFirst(request));
    } else {
      // Páginas: Stale While Revalidate
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Helper: Verificar si es request de API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Helper: Verificar si es asset estático
function isStaticAsset(url) {
  const extensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2'];
  return extensions.some((ext) => url.pathname.endsWith(ext));
}

// Estrategia: Cache First
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Estrategia: Network First
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(
      JSON.stringify({ error: 'Sin conexión', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    const cache = caches.open(CACHE_NAME);
    cache.then((c) => c.put(request, response.clone()));
    return response;
  });
  
  return cached || fetchPromise;
}

// Background Sync: Sincronizar cuando vuelve la conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-testimonials') {
    event.waitUntil(syncTestimonials());
  }
});

async function syncTestimonials() {
  console.log('[SW] Sincronizando testimonios...');
  // Aquí implementarías la lógica de sincronización
}
```

### PASO 2: Registrar Service Worker

```typescript
// app/layout.tsx o app/register-sw.tsx

'use client';

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ SW registrado:', registration);
            
            // Verificar actualizaciones cada hora
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error('❌ Error registrando SW:', error);
          });
      });
    }
  }, []);

  return null;
}
```

```typescript
// app/layout.tsx

import { RegisterServiceWorker } from './register-sw';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
```

---

## 💾 Estrategias de Cache

### 1. Cache First (Cache Falling Back to Network)

**Uso:** Assets estáticos (CSS, JS, imágenes)

```javascript
async function cacheFirst(request) {
  // 1. Buscar en cache
  const cached = await caches.match(request);
  if (cached) return cached;
  
  // 2. Si no está, buscar en red
  const response = await fetch(request);
  
  // 3. Guardar en cache para la próxima
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  
  return response;
}
```

**Ventajas:** Muy rápido, funciona offline
**Desventajas:** Puede servir contenido desactualizado

---

### 2. Network First (Network Falling Back to Cache)

**Uso:** Datos de API que cambian frecuentemente

```javascript
async function networkFirst(request) {
  try {
    // 1. Intentar red primero
    const response = await fetch(request);
    
    // 2. Guardar en cache
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    
    return response;
  } catch (error) {
    // 3. Si falla, usar cache
    const cached = await caches.match(request);
    if (cached) return cached;
    
    throw error;
  }
}
```

**Ventajas:** Siempre intenta datos frescos
**Desventajas:** Más lento, requiere conexión

---

### 3. Stale While Revalidate

**Uso:** Páginas, datos que pueden estar un poco desactualizados

```javascript
async function staleWhileRevalidate(request) {
  // 1. Devolver cache inmediatamente (si existe)
  const cached = await caches.match(request);
  
  // 2. Actualizar en background
  const fetchPromise = fetch(request).then((response) => {
    const cache = caches.open(CACHE_NAME);
    cache.then((c) => c.put(request, response.clone()));
    return response;
  });
  
  // 3. Devolver cache o esperar fetch
  return cached || fetchPromise;
}
```

**Ventajas:** Rápido + datos actualizados eventualmente
**Desventajas:** Usuario puede ver datos viejos momentáneamente

---

### 4. Network Only

**Uso:** Operaciones críticas (login, pagos)

```javascript
async function networkOnly(request) {
  return fetch(request);
}
```

---

### 5. Cache Only

**Uso:** Assets que nunca cambian

```javascript
async function cacheOnly(request) {
  return caches.match(request);
}
```

---

## 🗄️ IndexedDB para Datos Offline

### Ya tienes IndexedDB implementado!

Tu archivo `indexeddb.adapter.ts` ya maneja el almacenamiento offline. Ahora hay que integrarlo con sincronización.

### Agregar campo de sincronización

```typescript
// stores/adapters/indexeddb.adapter.ts

interface StoredData {
  id: string;
  syncStatus: 'synced' | 'pending' | 'error';  // ✅ Nuevo campo
  lastSyncAttempt?: Date;
  syncError?: string;
  [key: string]: any;
}

class IndexedDBManager {
  // ... código existente ...
  
  /**
   * Marcar item como pendiente de sincronización
   */
  async markAsPending(storeName: StoreName, key: string): Promise<void> {
    const item = await this.getItem(key);
    if (item) {
      item.syncStatus = 'pending';
      await this.setItem(key, item);
    }
  }
  
  /**
   * Obtener todos los items pendientes de sincronización
   */
  async getPendingItems(storeName: StoreName): Promise<StoredData[]> {
    if (!this.dbPromise) return [];
    
    const db = await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const items = request.result || [];
        const pending = items.filter(
          (item: StoredData) => item.syncStatus === 'pending'
        );
        resolve(pending);
      };
      
      request.onerror = () => reject(new Error('Error obteniendo items pendientes'));
    });
  }
  
  /**
   * Marcar item como sincronizado
   */
  async markAsSynced(storeName: StoreName, key: string): Promise<void> {
    const item = await this.getItem(key);
    if (item) {
      item.syncStatus = 'synced';
      item.lastSyncAttempt = new Date();
      delete item.syncError;
      await this.setItem(key, item);
    }
  }
  
  /**
   * Marcar item con error de sincronización
   */
  async markAsError(storeName: StoreName, key: string, error: string): Promise<void> {
    const item = await this.getItem(key);
    if (item) {
      item.syncStatus = 'error';
      item.lastSyncAttempt = new Date();
      item.syncError = error;
      await this.setItem(key, item);
    }
  }
}
```

---

## 🔄 Sincronización en Background

### PASO 1: Crear Sync Manager

```typescript
// stores/sync/offline-sync-manager.ts

import { indexedDBManager } from '../adapters/indexeddb.adapter';
import { api } from '@/api';

export class OfflineSyncManager {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Iniciar sincronización automática
   */
  startAutoSync(intervalMs = 60000) {
    // Sincronizar cada minuto (o cuando especifiques)
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, intervalMs);
    
    // Sincronizar cuando vuelve la conexión
    window.addEventListener('online', () => {
      this.syncAll();
    });
  }

  /**
   * Detener sincronización automática
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sincronizar todos los stores
   */
  async syncAll() {
    if (this.isSyncing) {
      console.log('⏳ Sincronización ya en curso...');
      return;
    }

    if (!navigator.onLine) {
      console.log('📡 Sin conexión, saltando sincronización');
      return;
    }

    this.isSyncing = true;
    console.log('🔄 Iniciando sincronización...');

    try {
      await Promise.all([
        this.syncTestimonials(),
        this.syncUsers(),
        // Agregar otros stores...
      ]);
      
      console.log('✅ Sincronización completada');
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincronizar testimonios
   */
  private async syncTestimonials() {
    const pending = await indexedDBManager.getPendingItems('testimonial');
    
    for (const item of pending) {
      try {
        // Si tiene un ID temporal, es un CREATE
        if (item.id.startsWith('temp-')) {
          const response = await api.post('/testimonials/', item);
          
          // Eliminar temporal y guardar con ID real
          await indexedDBManager.removeItem(item.id);
          await indexedDBManager.setItem(response.data.id, {
            ...response.data,
            syncStatus: 'synced',
          });
        }
        // Si tiene ID real, es un UPDATE
        else {
          await api.patch(`/testimonials/${item.id}/`, item);
          await indexedDBManager.markAsSynced('testimonial', item.id);
        }
        
        console.log(`✅ Testimonial ${item.id} sincronizado`);
      } catch (error: any) {
        console.error(`❌ Error sincronizando ${item.id}:`, error);
        await indexedDBManager.markAsError(
          'testimonial',
          item.id,
          error.message
        );
      }
    }
  }

  /**
   * Sincronizar users
   */
  private async syncUsers() {
    // Similar a syncTestimonials
  }
}

export const offlineSyncManager = new OfflineSyncManager();
```

### PASO 2: Inicializar Sync Manager

```typescript
// app/providers.tsx

'use client';

import { useEffect } from 'react';
import { offlineSyncManager } from '@/stores/sync/offline-sync-manager';

export function Providers({ children }) {
  useEffect(() => {
    // Iniciar sincronización automática cada minuto
    offlineSyncManager.startAutoSync(60000);
    
    return () => {
      offlineSyncManager.stopAutoSync();
    };
  }, []);

  return <>{children}</>;
}
```

### PASO 3: Usar en Stores

```typescript
// stores/testimonial/testimonial.store.ts

import { create } from 'zustand';
import { indexedDBManager } from '../adapters/indexeddb.adapter';
import { offlineSyncManager } from '../sync/offline-sync-manager';
import { api } from '@/api';

interface TestimonialState {
  testimonials: Testimonial[];
  createTestimonial: (data: Partial<Testimonial>) => Promise<void>;
}

export const useTestimonialStore = create<TestimonialState>((set, get) => ({
  testimonials: [],

  createTestimonial: async (data) => {
    // 1. Crear ID temporal
    const tempId = `temp-${Date.now()}`;
    const newTestimonial = {
      ...data,
      id: tempId,
      syncStatus: 'pending' as const,
      created_at: new Date(),
    };

    // 2. Guardar en IndexedDB inmediatamente
    await indexedDBManager.setItem(tempId, newTestimonial);

    // 3. Actualizar UI inmediatamente
    set((state) => ({
      testimonials: [...state.testimonials, newTestimonial],
    }));

    // 4. Intentar sincronizar en background si hay conexión
    if (navigator.onLine) {
      try {
        const response = await api.post('/testimonials/', data);
        
        // Reemplazar temporal con real
        await indexedDBManager.removeItem(tempId);
        await indexedDBManager.setItem(response.data.id, {
          ...response.data,
          syncStatus: 'synced',
        });
        
        // Actualizar UI con ID real
        set((state) => ({
          testimonials: state.testimonials.map((t) =>
            t.id === tempId ? { ...response.data, syncStatus: 'synced' } : t
          ),
        }));
      } catch (error) {
        console.warn('Sin conexión, se sincronizará después');
        // El item queda como 'pending' para sincronizar después
      }
    }
  },
}));
```

---

## 🌐 PWA (Progressive Web App)

### PASO 1: Crear Manifest

```json
// public/manifest.json

{
  "name": "Testimonial App",
  "short_name": "Testimonials",
  "description": "App para gestionar testimonios",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot1.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

### PASO 2: Agregar a HTML

```typescript
// app/layout.tsx

export const metadata = {
  manifest: '/manifest.json',
  title: 'Testimonial App',
  description: 'App para gestionar testimonios',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Testimonials',
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### PASO 3: Instalar PWA

```typescript
// components/InstallPWA.tsx

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      console.log('✅ PWA instalada');
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó instalar');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg">
      <p className="mb-2">¿Instalar la app?</p>
      <Button onClick={handleInstall}>
        📱 Instalar
      </Button>
    </div>
  );
}
```

---

## 📡 Detección de Conexión

### Componente de Estado de Conexión

```typescript
// components/ConnectionStatus.tsx

'use client';

import { useEffect, useState } from 'react';
import { offlineSyncManager } from '@/stores/sync/offline-sync-manager';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    // Estado inicial
    setIsOnline(navigator.onLine);

    // Listeners
    const handleOnline = () => {
      setIsOnline(true);
      offlineSyncManager.syncAll();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null; // O mostrar badge de "Conectado"
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center z-50">
      📴 Sin conexión - Trabajando en modo offline
      {pendingSync > 0 && (
        <span className="ml-2">({pendingSync} cambios pendientes)</span>
      )}
    </div>
  );
}
```

### Hook personalizado

```typescript
// hooks/useOnlineStatus.ts

import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

```typescript
// Usar en componentes

export function MyComponent() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {!isOnline && (
        <Alert>Estás trabajando offline</Alert>
      )}
      {/* resto del componente */}
    </div>
  );
}
```

---

## 🔧 Implementación Completa - Ejemplo

### Crear Testimonial Offline

```typescript
// components/CreateTestimonialForm.tsx

'use client';

import { useState } from 'react';
import { useTestimonialStore } from '@/stores';
import { useOnlineStatus } from '@/hooks';
import { Button } from '@/components/ui/button';

export function CreateTestimonialForm() {
  const isOnline = useOnlineStatus();
  const createTestimonial = useTestimonialStore((s) => s.createTestimonial);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTestimonial(formData);
      setFormData({ title: '', content: '' });
      
      if (!isOnline) {
        alert('✅ Guardado offline. Se sincronizará cuando vuelva la conexión.');
      } else {
        alert('✅ Testimonial creado');
      }
    } catch (error) {
      alert('❌ Error al crear testimonial');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isOnline && (
        <div className="bg-yellow-100 p-2 mb-4 rounded">
          📴 Modo offline - Los cambios se sincronizarán automáticamente
        </div>
      )}
      
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Título"
        required
      />
      
      <textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        placeholder="Contenido"
        required
      />
      
      <Button type="submit">
        {isOnline ? 'Crear' : 'Guardar offline'}
      </Button>
    </form>
  );
}
```

---

## 📊 Resumen de Arquitectura

```typescript
// Flujo completo de una operación offline

// 1. Usuario crea testimonial
createTestimonial(data)
  ↓
// 2. Guardar en IndexedDB con syncStatus: 'pending'
indexedDBManager.setItem(tempId, { ...data, syncStatus: 'pending' })
  ↓
// 3. Actualizar UI inmediatamente
set({ testimonials: [...testimonials, newTestimonial] })
  ↓
// 4. Si hay conexión, intentar sincronizar
if (navigator.onLine) {
  api.post('/testimonials/', data)
    ↓
  // 5a. Éxito: Actualizar ID y marcar como synced
  indexedDBManager.markAsSynced()
} else {
  // 5b. Sin conexión: Queda como pending
  // Se sincronizará automáticamente después
}
  ↓
// 6. Background sync automático cada minuto
offlineSyncManager.syncAll()
  ↓
// 7. Cuando vuelve la conexión
window.addEventListener('online', () => {
  offlineSyncManager.syncAll()
})
```

---

## ✅ Checklist de Implementación

### Service Worker
- [ ] Crear `public/sw.js`
- [ ] Implementar estrategias de cache
- [ ] Registrar Service Worker en app
- [ ] Probar offline en DevTools

### IndexedDB
- [ ] Agregar campo `syncStatus`
- [ ] Implementar `markAsPending()`
- [ ] Implementar `getPendingItems()`
- [ ] Implementar `markAsSynced()`

### Sincronización
- [ ] Crear `OfflineSyncManager`
- [ ] Implementar sync por store
- [ ] Configurar sync automático
- [ ] Manejar errores de sync

### PWA
- [ ] Crear `manifest.json`
- [ ] Agregar iconos (192x192, 512x512)
- [ ] Configurar metadata en layout
- [ ] Implementar botón de instalación

### UI/UX
- [ ] Componente de estado de conexión
- [ ] Hook `useOnlineStatus`
- [ ] Indicadores de sync pendiente
- [ ] Mensajes de feedback al usuario

### Testing
- [ ] Probar crear datos offline
- [ ] Probar sincronización al volver online
- [ ] Probar con DevTools offline
- [ ] Probar instalación como PWA

---

## 🐛 Troubleshooting

### Service Worker no se registra

```typescript
// Verificar en consola
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('SW registrados:', regs);
});
```

### Cache no funciona

```typescript
// Limpiar cache
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

### IndexedDB no guarda

```typescript
// Verificar en DevTools
// Application > Storage > IndexedDB
```

### PWA no se puede instalar

**Verificar:**
- Manifest.json es válido
- Service Worker registrado
- HTTPS habilitado (o localhost)
- Iconos con tamaños correctos

---

## 📚 Referencias

- [Service Worker MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox](https://developer.chrome.com/docs/workbox/) - Librería de Google para SW
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)

---

**Fecha de creación:** Diciembre 2025  
**Última actualización:** Diciembre 2025  
**Versión:** 1.0
