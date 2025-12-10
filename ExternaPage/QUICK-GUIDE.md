# 🎯 Guía Visual Rápida - Zustand con useShallow

## 🚦 Semáforo de Decisión

```
┌─────────────────────────────────────────────────┐
│ ¿Qué necesitas seleccionar del store?          │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    Un valor      Múltiples      Acción
    primitivo      valores      (función)
        │             │             │
        ▼             ▼             ▼
```

### ✅ Un valor primitivo (string, number, boolean)

```tsx
// ✅ CORRECTO - Selección directa
const userId = useAuthStore((state) => state.userId);
const isLoading = useAuthStore((state) => state.isLoading);

// ✅ AÚN MEJOR - Usar selector predefinido
const isLoggedIn = useAuthStore(selectIsLoggedIn);
```

**¿Cuándo?** Cuando solo necesitas UN valor simple
**Performance:** ⚡⚡⚡ Excelente

---

### ✅ Múltiples valores (objeto, array)

```tsx
// ❌ INCORRECTO - Crea objeto nuevo cada vez
const data = useAuthStore((state) => ({
  userId: state.userId,
  role: state.role
})); // Re-render siempre!

// ✅ CORRECTO - Usa useShallow
import { useShallow } from 'zustand/react/shallow';

const { userId, role } = useAuthStore(
  useShallow((state) => ({
    userId: state.userId,
    role: state.role
  }))
);

// ✅ AÚN MEJOR - Usa selector predefinido
const { userId, role } = useAuthStore(useShallow(selectUserData));
```

**¿Cuándo?** Cuando necesitas 2+ valores del store
**Performance:** ⚡⚡⚡ Excelente (con useShallow)

---

### ✅ Una acción (función)

```tsx
// ✅ CORRECTO - Las funciones nunca cambian
const logout = useAuthStore((state) => state.logout);
const loginUser = useAuthStore((state) => state.loginUser);

// ℹ️ NO necesita useShallow (las funciones son estables)
```

**¿Cuándo?** Cuando necesitas ejecutar acciones
**Performance:** ⚡⚡⚡ Excelente (no causa re-renders)

---

## 📊 Tabla de Decisión Rápida

| Caso de Uso | Código | useShallow | Re-render cuando... |
|-------------|--------|------------|---------------------|
| 1 primitivo | `state.userId` | ❌ No necesario | userId cambia |
| 2+ primitivos | `{ userId, role }` | ✅ Necesario | userId O role cambian |
| Array | `[token1, token2]` | ✅ Necesario | Elementos cambian |
| Objeto complejo | `{ user: {...} }` | ✅ Necesario | Propiedades cambian |
| 1 acción | `state.logout` | ❌ No necesario | Nunca (estable) |
| 2+ acciones | `{ login, logout }` | ⚠️ Opcional | Nunca (estables) |
| Selector predefinido | `selectUserData` | ✅ Siempre | Solo lo que usa |

---

## 🎨 Patrones Visuales

### Patrón 1: Verificar Login Simple

```
Component
    │
    ├─► useAuthStore(selectIsLoggedIn)
    │       │
    │       └─► ¿isAuthenticated && accessToken && userId?
    │               │
    │               ├─► true  → Mostrar UserMenu
    │               └─► false → Mostrar LoginButton
    │
    └─► Re-render solo cuando estado de login cambia ✓
```

### Patrón 2: Header Completo

```
Header
    │
    ├─► useAuthStore(selectIsLoggedIn)
    │       └─► isLoggedIn
    │
    ├─► useAuthStore(useShallow(selectUserData))
    │       └─► { userId, role }
    │
    └─► useAuthStore(state => state.logout)
            └─► logout function

Re-renders:
  ✅ Cuando isLoggedIn cambia
  ✅ Cuando userId o role cambian
  ❌ Cuando isLoading cambia
  ❌ Cuando error cambia
  ❌ Cuando accessToken cambia
```

### Patrón 3: Login Form

```
LoginForm
    │
    ├─► useAuthStore(useShallow(selectLoadingState))
    │       └─► { isLoading, error }
    │
    ├─► useAuthStore(state => state.loginUser)
    │       └─► loginUser function
    │
    └─► useAuthStore(state => state.clearError)
            └─► clearError function

Re-renders:
  ✅ Cuando isLoading cambia
  ✅ Cuando error cambia
  ❌ Cuando userId cambia
  ❌ Cuando role cambia
```

---

## 🔍 Debugging Visual

### ¿Cómo saber si tu componente re-renderiza demasiado?

```tsx
function MyComponent() {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 MyComponent render #${renderCount.current}`);
  });
  
  // Tu código aquí...
}
```

### Checklist de Optimización

```
□ ¿Usa selectores específicos? (no state completo)
□ ¿Usa useShallow para objetos/arrays?
□ ¿Los selectores están fuera del componente?
□ ¿Las acciones se seleccionan directamente?
□ ¿Hay re-renders cuando no debería?
```

---

## 💡 Cheat Sheet de Imports

```tsx
// Siempre importar estos en componentes que usan auth
import { useShallow } from 'zustand/react/shallow';
import useAuthStore, { 
  selectIsLoggedIn,
  selectUserData,
  selectTokens,
  selectLoadingState,
  selectAuthActions
} from '@/store/auth/auth.store';
```

---

## 🎯 Ejemplos Lado a Lado

### Ejemplo A: Botón de Logout

```tsx
// ❌ INCORRECTO
function LogoutButton() {
  const state = useAuthStore();
  return <button onClick={state.logout}>Salir</button>;
}
// Re-render en CADA cambio del store

// ✅ CORRECTO
function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  return <button onClick={logout}>Salir</button>;
}
// NUNCA re-render (función estable)
```

### Ejemplo B: Mostrar Info de Usuario

```tsx
// ❌ INCORRECTO
function UserInfo() {
  const userId = useAuthStore((state) => state.userId);
  const role = useAuthStore((state) => state.role);
  return <div>{userId} - {role}</div>;
}
// 2 suscripciones separadas

// ✅ CORRECTO
function UserInfo() {
  const { userId, role } = useAuthStore(useShallow(selectUserData));
  return <div>{userId} - {role}</div>;
}
// 1 suscripción optimizada
```

### Ejemplo C: Header Condicional

```tsx
// ❌ INCORRECTO
function Header() {
  const store = useAuthStore();
  return store.isAuthenticated ? <UserMenu /> : <LoginButton />;
}
// Re-render en TODO cambio

// ✅ CORRECTO
function Header() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  return isLoggedIn ? <UserMenu /> : <LoginButton />;
}
// Re-render solo cuando login status cambia
```

---

## 📈 Gráfico de Performance

```
Re-renders sin optimizar:
████████████████████ 100% (20 re-renders)

Re-renders con selectores:
██████████ 50% (10 re-renders)

Re-renders con useShallow:
███ 15% (3 re-renders)

Re-renders con selectores + useShallow:
██ 10% (2 re-renders) ← ÓPTIMO
```

---

## 🎓 Regla de Oro

```
┌────────────────────────────────────────────────┐
│  Si seleccionas MÚLTIPLES valores → useShallow │
│  Si seleccionas UN valor → directo             │
│  Si seleccionas ACCIÓN → directo               │
│  Si usas SELECTOR → considera useShallow       │
└────────────────────────────────────────────────┘
```

---

## 🔗 Recursos Rápidos

- 📖 Documentación completa: `store/auth/README.md`
- 🧪 Ejemplos interactivos: `components/examples/ShallowComparison.tsx`
- 📊 Comparativa de performance: `PERFORMANCE-COMPARISON.md`
- 📝 Resumen de cambios: `REFACTORING-SUMMARY.md`
- 🌐 Docs oficiales: https://zustand.docs.pmnd.rs/

---

## ⚡ TL;DR (Demasiado Largo; No Leí)

```tsx
// 1️⃣ Un valor → directo
const userId = useAuthStore(state => state.userId);

// 2️⃣ Múltiples valores → useShallow
const { userId, role } = useAuthStore(
  useShallow(state => ({ userId: state.userId, role: state.role }))
);

// 3️⃣ Mejor aún → selector predefinido
const { userId, role } = useAuthStore(useShallow(selectUserData));

// 4️⃣ Acción → directo (nunca cambia)
const logout = useAuthStore(state => state.logout);
```

**Resultado: 70-80% menos re-renders innecesarios! 🚀**
