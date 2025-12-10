# Auth Store - Mejores Prácticas de Zustand

Este documento explica cómo usar el `auth.store.ts` siguiendo las mejores prácticas de Zustand para optimizar el rendimiento y evitar re-renders innecesarios.

## 📚 Conceptos Clave

### 1. **Selectores Optimizados**
Los selectores son funciones que extraen datos específicos del store. Usar selectores ayuda a:
- ✅ Evitar re-renders innecesarios
- ✅ Código más limpio y reutilizable
- ✅ Mejor performance

### 2. **useShallow**
`useShallow` es un hook de Zustand que hace comparación superficial de objetos/arrays. Úsalo cuando:
- Seleccionas múltiples valores en un objeto
- Seleccionas arrays
- Quieres evitar re-renders por cambios en propiedades que no usas

### 3. **Separación de Estado y Acciones**
Las acciones (funciones) nunca cambian, por lo que no deberían causar re-renders.

---

## 🎯 Patrones de Uso

### ✅ CORRECTO: Usar selectores predefinidos

```tsx
import useAuthStore, { selectIsLoggedIn } from '@/store/auth/auth.store';

function MyComponent() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  // Solo re-renderiza si cambia el estado de login
  
  return <div>{isLoggedIn ? 'Logueado' : 'No logueado'}</div>;
}
```

### ✅ CORRECTO: Usar useShallow para múltiples valores

```tsx
import { useShallow } from 'zustand/react/shallow';
import useAuthStore, { selectUserData } from '@/store/auth/auth.store';

function UserProfile() {
  const { userId, role } = useAuthStore(useShallow(selectUserData));
  // Solo re-renderiza si cambian userId o role
  // NO re-renderiza si cambia accessToken, isLoading, etc.
  
  return <div>Usuario {userId} - Rol: {role}</div>;
}
```

### ✅ CORRECTO: Seleccionar acciones directamente

```tsx
import useAuthStore from '@/store/auth/auth.store';

function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  // Las funciones nunca cambian, no causa re-renders
  
  return <button onClick={logout}>Cerrar Sesión</button>;
}
```

### ❌ INCORRECTO: Seleccionar todo el estado

```tsx
// ❌ MAL - Causa re-render por CUALQUIER cambio en el store
function MyComponent() {
  const state = useAuthStore();
  return <div>{state.userId}</div>;
}
```

### ❌ INCORRECTO: Múltiples selectores sin useShallow

```tsx
// ❌ MAL - Sin useShallow, puede causar re-renders innecesarios
function MyComponent() {
  const userId = useAuthStore((state) => state.userId);
  const role = useAuthStore((state) => state.role);
  // Dos suscripciones separadas, menos eficiente
}

// ✅ MEJOR - Usa useShallow
function MyComponent() {
  const { userId, role } = useAuthStore(
    useShallow((state) => ({ userId: state.userId, role: state.role }))
  );
}

// ✅ AÚN MEJOR - Usa selectores predefinidos
function MyComponent() {
  const { userId, role } = useAuthStore(useShallow(selectUserData));
}
```

---

## 📖 Selectores Disponibles

### `selectIsLoggedIn`
Verifica si el usuario está logueado (tiene token válido y userId).

```tsx
const isLoggedIn = useAuthStore(selectIsLoggedIn);
```

### `selectUserData`
Obtiene datos del usuario (userId, role, isAuthenticated).

```tsx
const { userId, role, isAuthenticated } = useAuthStore(useShallow(selectUserData));
```

### `selectTokens`
Obtiene tokens de acceso y refresh.

```tsx
const { accessToken, refreshToken } = useAuthStore(useShallow(selectTokens));
```

### `selectLoadingState`
Obtiene estado de carga y errores.

```tsx
const { isLoading, error } = useAuthStore(useShallow(selectLoadingState));
```

### `selectAuthActions`
Obtiene todas las acciones (útil para pasar como props).

```tsx
const actions = useAuthStore(useShallow(selectAuthActions));
// actions.loginUser, actions.logout, etc.
```

---

## 🎨 Ejemplos Completos

### Ejemplo 1: Header con Login Condicional

```tsx
import { useShallow } from 'zustand/react/shallow';
import useAuthStore, { selectIsLoggedIn, selectUserData } from '@/store/auth/auth.store';

export default function Header() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const { role, userId } = useAuthStore(useShallow(selectUserData));
  const logout = useAuthStore((state) => state.logout);

  return (
    <header>
      {!isLoggedIn ? (
        <div>
          <button>Login</button>
          <button>Registrarse</button>
        </div>
      ) : (
        <div>
          <span>Usuario: {userId} ({role})</span>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      )}
    </header>
  );
}
```

### Ejemplo 2: Formulario de Login

```tsx
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useAuthStore, { selectLoadingState } from '@/store/auth/auth.store';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { isLoading, error } = useAuthStore(useShallow(selectLoadingState));
  const { loginUser, clearError } = useAuthStore(
    useShallow((state) => ({
      loginUser: state.loginUser,
      clearError: state.clearError,
    }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await loginUser({ email, password });
      // Redirigir después del login
    } catch (err) {
      console.error('Error en login:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        disabled={isLoading}
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Ingresar'}
      </button>
    </form>
  );
}
```

### Ejemplo 3: Hook Personalizado

```tsx
import { useShallow } from 'zustand/react/shallow';
import useAuthStore, { selectIsLoggedIn, selectUserData } from '@/store/auth/auth.store';

export function useAuth() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const { role, userId } = useAuthStore(useShallow(selectUserData));
  const logout = useAuthStore((state) => state.logout);

  return {
    isLoggedIn,
    role,
    userId,
    logout,
    // Computed properties
    isAdmin: role === 'administrador',
    isEditor: role === 'editor',
    isVisitor: role === 'visitante',
  };
}

// Uso
function MyComponent() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  
  if (!isLoggedIn) return <div>Por favor, inicia sesión</div>;
  if (!isAdmin) return <div>No tienes permisos</div>;
  
  return <AdminPanel onLogout={logout} />;
}
```

### Ejemplo 4: Proteger Rutas

```tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore, { selectIsLoggedIn } from '@/store/auth/auth.store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return <div>Verificando autenticación...</div>;
  }

  return <>{children}</>;
}
```

---

## 🚀 Performance Tips

1. **Siempre usa selectores específicos** - Solo selecciona lo que necesitas
2. **Usa useShallow para objetos/arrays** - Evita re-renders por referencia
3. **No crees objetos nuevos en selectores inline** - Usa selectores predefinidos
4. **Separa acciones del estado** - Las funciones no cambian
5. **Usa selectores predefinidos** - Son más eficientes y reutilizables

---

## 📊 Comparación de Rendimiento

| Patrón | Re-renders | Performance |
|--------|-----------|-------------|
| `useAuthStore()` | ⚠️ Todos los cambios | ❌ Muy mala |
| `useAuthStore(state => state.userId)` | ✅ Solo userId | ✅ Buena |
| `useAuthStore(selectUserData)` sin useShallow | ⚠️ Cualquier campo | ⚠️ Regular |
| `useAuthStore(useShallow(selectUserData))` | ✅ Solo campos usados | ✅✅ Excelente |

---

## 🔗 Referencias

- [Documentación de Zustand](https://zustand.docs.pmnd.rs/)
- [Prevent rerenders with useShallow](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)
- [Performance Optimization](https://zustand.docs.pmnd.rs/guides/performance)
