# 🔐 Implementación de httpOnly Cookies para JWT

## 📋 Índice
- [¿Por qué httpOnly Cookies?](#por-qué-httponly-cookies)
- [Arquitectura](#arquitectura)
- [Implementación Backend (Django)](#implementación-backend-django)
- [Implementación Frontend (Next.js)](#implementación-frontend-nextjs)
- [Configuración de Seguridad](#configuración-de-seguridad)
- [Testing](#testing)
- [Comparación vs localStorage](#comparación-vs-localstorage)

---

## 🎯 ¿Por qué httpOnly Cookies?

### Ventajas sobre localStorage:
- ✅ **Inmune a XSS**: JavaScript no puede acceder a las cookies httpOnly
- ✅ **Automático**: El navegador envía las cookies automáticamente
- ✅ **Más seguro**: Protección contra ataques de robo de tokens
- ✅ **No requiere interceptores**: Simplifica el código frontend

### Comparación de Seguridad:

| Método | Protección XSS | Protección CSRF | Facilidad |
|--------|----------------|-----------------|-----------|
| httpOnly Cookie | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| localStorage | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| sessionStorage | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Memory only | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│             Frontend (Next.js)              │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │    Auth Store (Sin tokens)         │   │
│  │  - userId                           │   │
│  │  - role                             │   │
│  │  - isAuthenticated                  │   │
│  └────────────────┬───────────────────┘   │
│                   │                         │
│  ┌────────────────▼───────────────────┐   │
│  │    API Client (withCredentials)    │   │
│  │  - Envía cookies automáticamente   │   │
│  └────────────────┬───────────────────┘   │
└───────────────────┼─────────────────────────┘
                    │
                    │ HTTP Request
                    │ (Cookies incluidas)
                    │
┌───────────────────▼─────────────────────────┐
│            Backend (Django)                 │
│                                             │
│  ┌────────────────────────────────────┐   │
│  │  JWTCookieAuthentication           │   │
│  │  Middleware                         │   │
│  │  - Lee cookie 'access_token'       │   │
│  │  - Agrega a Authorization header   │   │
│  └────────────────┬───────────────────┘   │
│                   │                         │
│  ┌────────────────▼───────────────────┐   │
│  │    Views                            │   │
│  │  - LoginView (establece cookies)   │   │
│  │  - LogoutView (borra cookies)      │   │
│  │  - RefreshView (renueva cookies)   │   │
│  └────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🔧 Implementación Backend (Django)

### 1. Actualizar LoginView

```python
# Backend/app/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from drf_spectacular.utils import extend_schema
from .serializers import LoginSerializer

@extend_schema(tags=['Login'])
class LoginView(generics.GenericAPIView):
    """
    Vista de login que establece tokens JWT en cookies httpOnly
    """
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Determinar el rol/grupo del usuario
        user_role = None
        if user.is_staff:
            user_role = "administrador"
        else:
            groups = user.groups.all()
            if groups.exists():
                user_role = groups.first().name
            else:
                user_role = "sin_grupo"
        
        # Crear response con datos del usuario (sin tokens)
        response = Response({
            'user_id': user.id,
            'rol': user_role,
            'message': 'Login exitoso'
        }, status=status.HTTP_200_OK)
        
        # 🔐 Configurar cookie para access token
        response.set_cookie(
            key='access_token',
            value=str(refresh.access_token),
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,      # No accesible desde JavaScript
            secure=not settings.DEBUG,  # Solo HTTPS en producción
            samesite='Lax',     # Protección CSRF (Lax o Strict)
            domain=None,        # Mismo dominio
            path='/'            # Disponible en toda la app
        )
        
        # 🔐 Configurar cookie para refresh token
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            domain=None,
            path='/'
        )
        
        return response
```

### 2. Crear LogoutView

```python
# Backend/app/views.py

@extend_schema(tags=['Login'])
class LogoutView(generics.GenericAPIView):
    """
    Vista de logout que borra las cookies de autenticación
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        response = Response({
            'message': 'Logout exitoso'
        }, status=status.HTTP_200_OK)
        
        # Borrar cookies de tokens
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')
        
        return response
```

### 3. Crear CookieTokenRefreshView

```python
# Backend/app/views.py

@extend_schema(tags=['Token'])
class CookieTokenRefreshView(generics.GenericAPIView):
    """
    Vista para renovar el access token usando la cookie de refresh token
    """
    
    def post(self, request):
        # Obtener refresh token de la cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token no encontrado en cookies'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Validar y generar nuevo access token
            token = RefreshToken(refresh_token)
            access_token = token.access_token
            
            response = Response({
                'message': 'Token renovado exitosamente'
            }, status=status.HTTP_200_OK)
            
            # Actualizar cookie de access token
            response.set_cookie(
                key='access_token',
                value=str(access_token),
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                path='/'
            )
            
            return response
            
        except Exception as e:
            return Response(
                {'error': 'Token inválido o expirado'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
```

### 4. Crear Middleware de Autenticación por Cookie

```python
# Backend/testimonios/middleware.py

from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

class JWTCookieAuthentication(MiddlewareMixin):
    """
    Middleware para autenticar usando JWT desde cookies httpOnly.
    
    Este middleware lee el token JWT de la cookie 'access_token'
    y lo agrega al header Authorization para que DRF pueda autenticar.
    """
    
    def process_request(self, request):
        # Solo procesar si no hay Authorization header
        if request.META.get('HTTP_AUTHORIZATION'):
            return None
        
        # Obtener token de la cookie
        access_token = request.COOKIES.get('access_token')
        
        if access_token:
            # Agregar el token al header Authorization
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
        
        return None
```

### 5. Actualizar Settings

```python
# Backend/testimonios/settings.py

# ==========================================
# Configuración de CORS para cookies
# ==========================================

CORS_ALLOW_CREDENTIALS = True  # 🔑 CRÍTICO: Permite enviar cookies

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://tu-app-frontend.vercel.app',
    # Agregar todos tus dominios frontend
]

# ==========================================
# Configuración de Cookies de Sesión
# ==========================================

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG  # Solo HTTPS en producción
SESSION_COOKIE_SAMESITE = 'Lax'    # 'Lax' o 'Strict'

# ==========================================
# Configuración de CSRF
# ==========================================

CSRF_COOKIE_HTTPONLY = False  # Debe ser False para que frontend pueda leerlo
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = 'Lax'

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://tu-app-frontend.vercel.app',
]

# ==========================================
# Configuración de JWT
# ==========================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    # ... resto de configuración
}

# ==========================================
# Middleware (ORDEN IMPORTANTE)
# ==========================================

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Debe estar antes de CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'testimonios.middleware.JWTCookieAuthentication',  # 🔑 Agregar nuestro middleware
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### 6. Actualizar URLs

```python
# Backend/app/urls.py

from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    CookieTokenRefreshView,
    # ... otras vistas
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    # ... otras rutas
]
```

---

## 🎨 Implementación Frontend (Next.js)

### 1. Actualizar API Configuration

```typescript
// ExternaPage/src/api/api.ts

import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  withCredentials: true,  // 🔑 CRÍTICO: Envía cookies automáticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de respuesta para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un 401 y no hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        await api.post('/token/refresh/');
        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, hacer logout
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 2. ELIMINAR el Interceptor de Request

```typescript
// ExternaPage/src/api/Interceptors/api.interceptor.request.ts

// ❌ ELIMINAR TODO ESTE ARCHIVO
// Ya no es necesario porque las cookies se envían automáticamente
// con withCredentials: true

// Si quieres mantener el archivo para logging, déjalo así:
import type { InternalAxiosRequestConfig } from "axios";
import { logger } from "@/core";
import { api } from "@/api";

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Solo logging, sin manipular tokens
  logger.debug(`📤 Request ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});
```

### 3. Actualizar Auth Store (Sin persistencia de tokens)

```typescript
// ExternaPage/src/stores/auth/auth.store.ts

import { create } from 'zustand';
import { login, logout as logoutApi, refreshToken } from '@/api';
import type { UserCredentials, LoginResponse } from '@/interfaces';

interface AuthState {
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Métodos
  loginUser: (credentials: UserCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial
  userId: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login: Solo guarda info del usuario (tokens en cookies)
  loginUser: async (credentials: UserCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const result = await login(credentials);

      if ('success' in result && result.success === false) {
        throw new Error(result.message);
      }

      const response = result as LoginResponse;

      // ✅ Solo guardamos info del usuario
      // Los tokens están en cookies httpOnly
      set({
        userId: response.user_id,
        role: response.rol,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw new Error(errorMessage);
    }
  },

  // Logout: Limpia estado y cookies
  logout: async () => {
    try {
      // Llama al endpoint que borra las cookies
      await logoutApi();
    } catch (error) {
      console.warn('Error al hacer logout en el servidor:', error);
    } finally {
      // Limpiar estado local
      set({
        userId: null,
        role: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // Refresh: Renueva el access token desde la cookie
  refresh: async () => {
    try {
      await refreshToken();
      // No necesitas actualizar el estado, la cookie se actualiza automáticamente
    } catch (error) {
      // Si falla el refresh, hacer logout
      await get().logout();
      throw error;
    }
  },

  // Verificar si está autenticado
  checkAuth: () => {
    return get().isAuthenticated;
  },
}));

// ❌ REMOVER el persist middleware
// Ya no guardamos tokens en localStorage/IndexedDB
```

### 4. Actualizar API Functions

```typescript
// ExternaPage/src/api/auth.api.ts

import { api } from './api';
import type { UserCredentials, LoginResponse } from '@/interfaces';

export const login = async (credentials: UserCredentials) => {
  const response = await api.post<LoginResponse>('/login/', credentials);
  // Las cookies se establecen automáticamente por el backend
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/logout/');
  // Las cookies se borran automáticamente por el backend
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/token/refresh/');
  // La cookie se actualiza automáticamente por el backend
  return response.data;
};
```

### 5. Crear Hook para Verificar Autenticación

```typescript
// ExternaPage/src/hooks/useAuth.ts

import { useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { useRouter } from 'next/navigation';

export const useAuth = (requireAuth = true) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!isLoading && requireAuth && !checkAuth()) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, requireAuth, router, checkAuth]);

  return { isAuthenticated, isLoading };
};
```

### 6. Actualizar Variables de Entorno

```env
# ExternaPage/.env.local

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Para producción
# NEXT_PUBLIC_API_URL=https://tu-backend.com/api
```

---

## 🔒 Configuración de Seguridad

### 1. Content Security Policy (Recomendado)

```typescript
// ExternaPage/next.config.ts

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 2. Configuración HTTPS en Producción

En Vercel (automático):
- ✅ HTTPS habilitado por defecto
- ✅ Certificados SSL automáticos

En Django (settings.py):
```python
# Solo para producción
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
```

---

## 🧪 Testing

### 1. Probar Login

```bash
# Terminal
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt \
  -v

# Verifica que recibes:
# Set-Cookie: access_token=...; HttpOnly; Path=/
# Set-Cookie: refresh_token=...; HttpOnly; Path=/
```

### 2. Probar Request Autenticado

```bash
# Terminal
curl -X GET http://localhost:8000/api/testimonials/ \
  -b cookies.txt \
  -v

# Debe funcionar con las cookies
```

### 3. Probar Logout

```bash
# Terminal
curl -X POST http://localhost:8000/api/logout/ \
  -b cookies.txt \
  -v

# Verifica que las cookies se borran:
# Set-Cookie: access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT
```

### 4. Frontend Testing

```typescript
// Componente de prueba
const TestAuth = () => {
  const { loginUser, logout, isAuthenticated } = useAuthStore();

  const handleLogin = async () => {
    try {
      await loginUser({
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Login exitoso');
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  return (
    <div>
      <p>Autenticado: {isAuthenticated ? 'Sí' : 'No'}</p>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

---

## 📊 Comparación vs localStorage

| Aspecto | httpOnly Cookies | localStorage |
|---------|------------------|--------------|
| **Seguridad XSS** | ⭐⭐⭐⭐⭐ No accesible desde JS | ⭐⭐ Vulnerable a XSS |
| **Seguridad CSRF** | ⭐⭐⭐⭐ Requiere SameSite | ⭐⭐⭐⭐⭐ Inmune |
| **Implementación** | ⭐⭐⭐ Requiere backend | ⭐⭐⭐⭐⭐ Simple |
| **Debugging** | ⭐⭐ Más difícil ver cookies | ⭐⭐⭐⭐⭐ Fácil en DevTools |
| **Cross-domain** | ⭐⭐ Requiere CORS correcto | ⭐⭐⭐⭐ Más flexible |
| **Persistencia** | ⭐⭐⭐⭐ Controlada por servidor | ⭐⭐⭐⭐⭐ Permanente |
| **Tamaño límite** | ~4KB por cookie | ~5-10MB |

---

## ✅ Checklist de Implementación

### Backend:
- [ ] Actualizar LoginView para establecer cookies
- [ ] Crear LogoutView para borrar cookies
- [ ] Crear CookieTokenRefreshView
- [ ] Crear JWTCookieAuthentication middleware
- [ ] Actualizar settings.py (CORS, cookies)
- [ ] Registrar middleware en MIDDLEWARE
- [ ] Actualizar URLs
- [ ] Probar con curl/Postman

### Frontend:
- [ ] Actualizar api.ts con `withCredentials: true`
- [ ] Eliminar/Modificar interceptor de request
- [ ] Actualizar auth.store.ts (sin tokens)
- [ ] Actualizar auth.api.ts
- [ ] Crear useAuth hook
- [ ] Actualizar variables de entorno
- [ ] Probar login/logout en UI
- [ ] Verificar cookies en DevTools (Application > Cookies)

### Producción:
- [ ] Configurar HTTPS en backend
- [ ] Agregar dominio de producción a CORS_ALLOWED_ORIGINS
- [ ] Agregar dominio a CSRF_TRUSTED_ORIGINS
- [ ] Configurar SECURE_SSL_REDIRECT
- [ ] Probar en Vercel/producción
- [ ] Verificar que cookies se establecen correctamente
- [ ] Probar flujo completo de auth

---

## 🐛 Troubleshooting

### Problema: Las cookies no se envían

**Solución:**
1. Verificar `withCredentials: true` en frontend
2. Verificar `CORS_ALLOW_CREDENTIALS = True` en backend
3. Verificar que frontend y backend están en el mismo dominio o en CORS_ALLOWED_ORIGINS

### Problema: Error CORS

**Solución:**
```python
# Backend settings.py
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Agregar tu dominio
]
```

### Problema: Cookies no se establecen en producción

**Solución:**
1. Verificar que usas HTTPS
2. Verificar `secure=True` en production
3. Verificar `samesite='Lax'` o `'None'` si necesitas cross-site

### Problema: 401 Unauthorized después de login

**Solución:**
1. Verificar que el middleware está registrado
2. Verificar el orden del middleware (después de AuthenticationMiddleware)
3. Verificar que la cookie se está enviando (DevTools > Network > Request Headers)

---

## 📚 Referencias

- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
- [Django REST Framework JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

## 🎯 Próximos Pasos

Después de implementar httpOnly cookies:

1. **Implementar Refresh Token Rotation**: Rotar refresh token en cada uso
2. **Agregar Rate Limiting**: Proteger endpoints de auth contra ataques de fuerza bruta
3. **Implementar 2FA**: Autenticación de dos factores
4. **Monitoring**: Agregar logs de intentos de login
5. **Session Management**: Permitir ver/revocar sesiones activas

---

**Fecha de creación:** Diciembre 2025  
**Última actualización:** Diciembre 2025  
**Versión:** 1.0
