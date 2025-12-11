# 🔄 Sincronización en Tiempo Real - Backend ↔️ Frontend

## 📋 Índice
- [Introducción](#introducción)
- [Opciones de Sincronización](#opciones-de-sincronización)
- [Recomendación para Vercel](#recomendación-para-vercel)
- [Implementación con React Query (Polling)](#implementación-con-react-query-polling)
- [Implementación con Pusher (Tiempo Real)](#implementación-con-pusher-tiempo-real)
- [Implementación con SSE (Server-Sent Events)](#implementación-con-sse-server-sent-events)
- [Estrategia Híbrida](#estrategia-híbrida)
- [Comparación de Opciones](#comparación-de-opciones)

---

## 🎯 Introducción

### ¿Por qué necesitamos sincronización?

Cuando el backend actualiza datos (testimonios, usuarios, etc.), el frontend necesita saber para actualizar la UI. Hay varias estrategias según tus necesidades:

- **Polling**: Frontend pregunta periódicamente "¿hay cambios?"
- **WebSockets**: Conexión bidireccional en tiempo real
- **SSE**: Servidor envía eventos al cliente
- **Push Notifications**: Notificaciones del sistema

---

## 🚀 Opciones de Sincronización

### 1. **Polling con React Query** ⭐⭐⭐

**¿Qué es?**: Frontend consulta al backend cada X segundos

```typescript
const { data } = useQuery({
  queryKey: ['testimonials'],
  queryFn: fetchTestimonials,
  refetchInterval: 30000, // Cada 30 segundos
});
```

**✅ Ventajas:**
- Súper simple de implementar
- Funciona 100% en Vercel
- No requiere infraestructura adicional
- Compatible con cualquier backend

**❌ Desventajas:**
- Delay de hasta 30 segundos (no es instantáneo)
- Más tráfico de red
- No es eficiente si los datos no cambian seguido

**📊 Recomendado para:**
- Apps donde no importa delay de 10-30 segundos
- MVP o prototipos
- Presupuesto limitado

---

### 2. **WebSockets Tradicionales** ❌ (No funciona bien en Vercel)

**¿Qué es?**: Conexión persistente bidireccional

```typescript
const ws = new WebSocket('wss://api.example.com');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateStore(data);
};
```

**❌ Problemas en Vercel:**
- Funciones serverless tienen timeout (10-60 seg)
- No mantienen conexiones persistentes
- Se desconectan constantemente

**✅ Alternativa:** Usar servicios externos como Pusher, Ably

---

### 3. **Server-Sent Events (SSE)** ⭐⭐

**¿Qué es?**: Servidor envía eventos al cliente (unidireccional)

```typescript
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateStore(data);
};
```

**✅ Ventajas:**
- HTTP estándar
- Auto-reconexión
- Más simple que WebSockets

**⚠️ Limitaciones en Vercel:**
- Edge Functions: ~25-30 segundos máximo
- Necesita reconexión constante

**📊 Recomendado para:**
- Notificaciones simples
- Actualizaciones no críticas

---

### 4. **Pusher / Ably** ⭐⭐⭐ (Mejor para tiempo real en Vercel)

**¿Qué es?**: Servicios de WebSocket como servicio

```typescript
const pusher = new Pusher(API_KEY);
const channel = pusher.subscribe('testimonials');
channel.bind('update', (data) => {
  updateStore(data);
});
```

**✅ Ventajas:**
- Tiempo real verdadero
- Funciona perfecto en Vercel
- Maneja millones de conexiones
- Free tier generoso

**💰 Costo:**
- Pusher: 200k mensajes/día gratis
- Ably: 6M mensajes/mes gratis

**📊 Recomendado para:**
- Apps colaborativas
- Chat, notificaciones instantáneas
- Cuando necesitas < 1 segundo de latencia

---

### 5. **Polling Inteligente con ETag** ⭐⭐⭐

**¿Qué es?**: Polling que solo descarga si hay cambios

```typescript
// Backend envía ETag
const etag = generateHash(data);
response.headers['ETag'] = etag;

// Frontend verifica
const response = await fetch('/api/testimonials', {
  headers: { 'If-None-Match': lastEtag }
});

if (response.status === 304) {
  // Sin cambios, no hacer nada
} else {
  // Hay cambios, actualizar
  const data = await response.json();
  updateStore(data);
}
```

**✅ Ventajas:**
- Eficiente (poco bandwidth)
- Simple de implementar
- Compatible con Vercel

**📊 Recomendado para:**
- Balance perfecto entre simplicidad y eficiencia

---

## 🎯 Recomendación para Vercel

### **Fase 1: MVP (Empezar aquí)** ⭐⭐⭐

**Usar: React Query con Polling**

```
Latencia: 10-30 segundos
Complejidad: Muy baja
Costo: $0
```

### **Fase 2: Escalamiento** ⭐⭐⭐

**Agregar: Pusher para tiempo real**

```
Latencia: < 1 segundo
Complejidad: Media
Costo: Free tier hasta 200k msg/día
```

### **Fase 3: Optimización** ⭐⭐

**Agregar: Polling con ETag**

```
Reduce bandwidth
Mantiene simplicidad
```

---

## 📦 Implementación con React Query (Polling)

### PASO 1: Instalar React Query

```bash
npm install @tanstack/react-query
```

### PASO 2: Configurar Provider

```typescript
// app/providers.tsx

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,        // 30 segundos
        refetchInterval: 30 * 1000,   // Polling cada 30 segundos
        refetchOnWindowFocus: true,   // Refetch al volver al tab
        refetchOnReconnect: true,     // Refetch al reconectar
        retry: 3,                     // Reintentar 3 veces
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```typescript
// app/layout.tsx

import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### PASO 3: Crear Hooks de Query

```typescript
// hooks/queries/useTestimonials.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import type { Testimonial } from '@/interfaces';

// Hook para obtener todos los testimonios
export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data } = await api.get<Testimonial[]>('/testimonials/');
      return data;
    },
    staleTime: 30 * 1000,      // Datos frescos por 30 seg
    refetchInterval: 30 * 1000, // Polling cada 30 seg
  });
};

// Hook para obtener un testimonial específico
export const useTestimonial = (id: string) => {
  return useQuery({
    queryKey: ['testimonial', id],
    queryFn: async () => {
      const { data } = await api.get<Testimonial>(`/testimonials/${id}/`);
      return data;
    },
    enabled: !!id, // Solo ejecutar si hay id
  });
};

// Hook para crear testimonial (con optimistic update)
export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTestimonial: Partial<Testimonial>) => {
      const { data } = await api.post<Testimonial>('/testimonials/', newTestimonial);
      return data;
    },
    onMutate: async (newTestimonial) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ['testimonials'] });

      // Snapshot del valor anterior
      const previousTestimonials = queryClient.getQueryData(['testimonials']);

      // Optimistic update
      queryClient.setQueryData<Testimonial[]>(['testimonials'], (old = []) => [
        ...old,
        { ...newTestimonial, id: 'temp-id', created_at: new Date() } as Testimonial,
      ]);

      return { previousTestimonials };
    },
    onError: (err, newTestimonial, context) => {
      // Revertir en caso de error
      queryClient.setQueryData(['testimonials'], context?.previousTestimonials);
    },
    onSuccess: () => {
      // Invalidar y refetch
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
};

// Hook para actualizar testimonial
export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Testimonial> }) => {
      const response = await api.patch<Testimonial>(`/testimonials/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial', data.id] });
    },
  });
};

// Hook para eliminar testimonial
export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/testimonials/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
};
```

### PASO 4: Usar en Componentes

```typescript
// components/TestimonialList.tsx

'use client';

import { useTestimonials, useDeleteTestimonial } from '@/hooks/queries';

export const TestimonialList = () => {
  const { data: testimonials, isLoading, error, isFetching } = useTestimonials();
  const deleteMutation = useDeleteTestimonial();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {isFetching && <div className="badge">Actualizando...</div>}
      
      {testimonials?.map((testimonial) => (
        <div key={testimonial.id}>
          <h3>{testimonial.title}</h3>
          <p>{testimonial.content}</p>
          <button 
            onClick={() => deleteMutation.mutate(testimonial.id)}
            disabled={deleteMutation.isPending}
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
};
```

```typescript
// components/CreateTestimonialForm.tsx

'use client';

import { useCreateTestimonial } from '@/hooks/queries';
import { useState } from 'react';

export const CreateTestimonialForm = () => {
  const createMutation = useCreateTestimonial();
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync(formData);
      setFormData({ title: '', content: '' });
      // ✅ La UI se actualiza inmediatamente (optimistic update)
      // ✅ Luego se sincroniza con el backend
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Título"
      />
      <textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        placeholder="Contenido"
      />
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Guardando...' : 'Crear'}
      </button>
    </form>
  );
};
```

---

## 🔥 Implementación con Pusher (Tiempo Real)

### PASO 1: Crear cuenta en Pusher

1. Ir a [pusher.com](https://pusher.com)
2. Crear cuenta gratuita
3. Crear un nuevo app/channel
4. Copiar las credenciales

### PASO 2: Instalar Pusher

```bash
# Frontend
npm install pusher-js

# Backend (Django)
pip install pusher
```

### PASO 3: Backend - Configurar Pusher

```python
# Backend/testimonios/settings.py

PUSHER_APP_ID = os.getenv('PUSHER_APP_ID')
PUSHER_KEY = os.getenv('PUSHER_KEY')
PUSHER_SECRET = os.getenv('PUSHER_SECRET')
PUSHER_CLUSTER = os.getenv('PUSHER_CLUSTER', 'us2')
```

```python
# Backend/app/pusher_client.py

import pusher
from django.conf import settings

pusher_client = pusher.Pusher(
    app_id=settings.PUSHER_APP_ID,
    key=settings.PUSHER_KEY,
    secret=settings.PUSHER_SECRET,
    cluster=settings.PUSHER_CLUSTER,
    ssl=True
)

def trigger_testimonial_update(event_type, testimonial_data):
    """
    Envía evento de actualización de testimonial
    
    event_type: 'created', 'updated', 'deleted'
    """
    pusher_client.trigger(
        'testimonials-channel',
        f'testimonial-{event_type}',
        {
            'testimonial': testimonial_data,
            'timestamp': str(timezone.now())
        }
    )
```

### PASO 4: Backend - Enviar eventos desde Views

```python
# Backend/app/views.py

from .pusher_client import trigger_testimonial_update

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    
    def perform_create(self, serializer):
        testimonial = serializer.save()
        
        # 🔥 Notificar a todos los clientes conectados
        trigger_testimonial_update('created', {
            'id': testimonial.id,
            'title': testimonial.title,
            'content': testimonial.content,
        })
    
    def perform_update(self, serializer):
        testimonial = serializer.save()
        
        trigger_testimonial_update('updated', {
            'id': testimonial.id,
            'title': testimonial.title,
            'content': testimonial.content,
        })
    
    def perform_destroy(self, instance):
        testimonial_id = instance.id
        instance.delete()
        
        trigger_testimonial_update('deleted', {
            'id': testimonial_id
        })
```

### PASO 5: Frontend - Configurar Pusher

```typescript
// lib/pusher.ts

import Pusher from 'pusher-js';

export const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  forceTLS: true,
});

export const testimonialChannel = pusher.subscribe('testimonials-channel');
```

```env
# .env.local

NEXT_PUBLIC_PUSHER_KEY=tu_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

### PASO 6: Frontend - Escuchar eventos

```typescript
// hooks/queries/useTestimonials.ts

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { testimonialChannel } from '@/lib/pusher';
import { useEffect } from 'react';

export const useTestimonials = () => {
  const queryClient = useQueryClient();

  // Query normal de React Query
  const query = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data } = await api.get<Testimonial[]>('/testimonials/');
      return data;
    },
  });

  // Escuchar eventos de Pusher
  useEffect(() => {
    // Evento: Testimonial creado
    testimonialChannel.bind('testimonial-created', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      // O agregar directamente sin refetch:
      // queryClient.setQueryData(['testimonials'], (old) => [...old, data.testimonial]);
    });

    // Evento: Testimonial actualizado
    testimonialChannel.bind('testimonial-updated', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    });

    // Evento: Testimonial eliminado
    testimonialChannel.bind('testimonial-deleted', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    });

    // Cleanup
    return () => {
      testimonialChannel.unbind('testimonial-created');
      testimonialChannel.unbind('testimonial-updated');
      testimonialChannel.unbind('testimonial-deleted');
    };
  }, [queryClient]);

  return query;
};
```

---

## 📡 Implementación con SSE (Server-Sent Events)

### PASO 1: Backend - Crear endpoint SSE

```python
# Backend/app/views.py

from django.http import StreamingHttpResponse
import json
import time

def testimonial_events(request):
    """
    Endpoint SSE para enviar eventos de testimonios
    """
    def event_stream():
        last_check = timezone.now()
        
        while True:
            # Verificar nuevos cambios desde last_check
            new_testimonials = Testimonial.objects.filter(
                updated_at__gt=last_check
            )
            
            if new_testimonials.exists():
                for testimonial in new_testimonials:
                    data = {
                        'id': testimonial.id,
                        'title': testimonial.title,
                        'content': testimonial.content,
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                
                last_check = timezone.now()
            
            time.sleep(5)  # Verificar cada 5 segundos
    
    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    
    return response
```

```python
# Backend/app/urls.py

urlpatterns = [
    path('events/testimonials/', testimonial_events, name='testimonial-events'),
]
```

### PASO 2: Frontend - Conectar a SSE

```typescript
// hooks/useSSE.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useTestimonialSSE = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/events/testimonials/`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Invalidar queries para refetch
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
      
      // Reconectar después de 5 segundos
      setTimeout(() => {
        // Recrear conexión
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);
};
```

```typescript
// Usar en componente

export const TestimonialList = () => {
  useTestimonialSSE(); // Escuchar eventos SSE
  const { data: testimonials } = useTestimonials();
  
  // ... resto del componente
};
```

---

## 🎯 Estrategia Híbrida

### Implementación Completa

```typescript
// stores/sync/sync-manager.ts

import Pusher from 'pusher-js';
import { QueryClient } from '@tanstack/react-query';

export class SyncManager {
  private pusher: Pusher | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Inicializar sincronización
   * Intenta usar Pusher, fallback a polling
   */
  init() {
    if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
      this.initPusher();
    } else {
      this.startPolling();
    }
  }

  /**
   * Pusher para tiempo real
   */
  private initPusher() {
    try {
      this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      });

      const channel = this.pusher.subscribe('testimonials-channel');

      channel.bind('testimonial-created', () => {
        this.invalidateQueries();
      });

      channel.bind('testimonial-updated', () => {
        this.invalidateQueries();
      });

      channel.bind('testimonial-deleted', () => {
        this.invalidateQueries();
      });

      console.log('✅ Pusher conectado');
    } catch (error) {
      console.warn('⚠️ Pusher falló, usando polling', error);
      this.startPolling();
    }
  }

  /**
   * Polling como fallback
   */
  private startPolling() {
    this.pollingInterval = setInterval(() => {
      this.invalidateQueries();
    }, 30000); // 30 segundos

    console.log('✅ Polling iniciado');
  }

  /**
   * Invalidar queries para refetch
   */
  private invalidateQueries() {
    this.queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    this.queryClient.invalidateQueries({ queryKey: ['users'] });
    this.queryClient.invalidateQueries({ queryKey: ['organizations'] });
  }

  /**
   * Limpiar recursos
   */
  destroy() {
    if (this.pusher) {
      this.pusher.disconnect();
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
```

```typescript
// app/providers.tsx

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SyncManager } from '@/stores/sync/sync-manager';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [syncManager] = useState(() => new SyncManager(queryClient));

  useEffect(() => {
    syncManager.init();
    return () => syncManager.destroy();
  }, [syncManager]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## 📊 Comparación de Opciones

| Método | Latencia | Complejidad | Costo | Vercel | Recomendación |
|--------|----------|-------------|-------|--------|---------------|
| **React Query Polling** | 10-30s | ⭐ Muy Baja | Gratis | ✅ Perfecto | ⭐⭐⭐ **Empezar aquí** |
| **Pusher** | <1s | ⭐⭐ Media | Free tier | ✅ Perfecto | ⭐⭐⭐ **Para tiempo real** |
| **Ably** | <1s | ⭐⭐ Media | Free tier | ✅ Perfecto | ⭐⭐⭐ Alternativa a Pusher |
| **SSE Edge** | 1-5s | ⭐⭐ Media | Gratis | ⚠️ Limitado | ⭐⭐ Solo si necesario |
| **WebSockets** | <1s | ⭐⭐⭐ Alta | - | ❌ No funciona | ❌ Evitar |
| **Polling + ETag** | 10-30s | ⭐⭐ Baja | Gratis | ✅ Perfecto | ⭐⭐⭐ Optimización |

---

## ✅ Checklist de Implementación

### Fase 1: Polling Básico
- [ ] Instalar `@tanstack/react-query`
- [ ] Configurar QueryClientProvider
- [ ] Crear hooks de queries
- [ ] Implementar en componentes
- [ ] Configurar `refetchInterval`
- [ ] Probar optimistic updates

### Fase 2: Tiempo Real (Opcional)
- [ ] Crear cuenta en Pusher/Ably
- [ ] Instalar pusher-js
- [ ] Configurar pusher en backend
- [ ] Enviar eventos desde views
- [ ] Suscribirse a eventos en frontend
- [ ] Probar sincronización en tiempo real

### Fase 3: Optimización
- [ ] Implementar ETag en backend
- [ ] Agregar validación de ETag en frontend
- [ ] Crear SyncManager híbrido
- [ ] Agregar logging de sincronización
- [ ] Probar en producción

---

## 🐛 Troubleshooting

### Polling no funciona

**Verificar:**
- `refetchInterval` está configurado
- No hay errores en la consola
- El endpoint del backend responde correctamente

### Pusher no conecta

**Verificar:**
- Las credenciales son correctas
- El cluster es correcto (us2, eu, etc.)
- CORS está configurado en Pusher dashboard
- No hay bloqueadores de contenido

### Optimistic updates no se revierten

**Verificar:**
- `onMutate` devuelve el contexto anterior
- `onError` usa el contexto para revertir
- Las queries están correctamente invalidadas

---

## 📚 Referencias

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Pusher Docs](https://pusher.com/docs/)
- [SSE MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Vercel Limits](https://vercel.com/docs/concepts/limits/overview)

---

**Fecha de creación:** Diciembre 2025  
**Última actualización:** Diciembre 2025  
**Versión:** 1.0
