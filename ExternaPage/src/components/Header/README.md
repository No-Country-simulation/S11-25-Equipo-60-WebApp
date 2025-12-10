# Header Component - Refactorización Clean Code

## 📋 Estructura del Módulo

```
Header/
├── components/           # Componentes UI (Presentational)
│   ├── UserMenu.tsx     # Componente principal del menú
│   ├── UserAvatar.tsx   # Avatar con iniciales
│   ├── UserInfo.tsx     # Información del usuario
│   ├── UserMenuItems.tsx # Items del menú
│   ├── AuthHeader.tsx   # Header de autenticación
│   └── index.ts         # Barrel export
├── hooks/               # Custom Hooks (Lógica de negocio)
│   ├── useUserMenu.ts   # Lógica del menú
│   ├── useUserInitials.ts # Generación de iniciales
│   └── index.ts
├── types/               # Definiciones TypeScript
│   └── user.types.ts    # Tipos de usuario y menú
├── constants/           # Configuración y constantes
│   └── menu.constants.ts # Configuración del menú
└── index.ts             # Export principal
```

## 🎯 Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
Cada componente y hook tiene **una única responsabilidad**:

- `UserMenu`: Orquestar el menú desplegable
- `UserAvatar`: Mostrar avatar con iniciales
- `UserInfo`: Mostrar información del usuario
- `UserMenuItems`: Renderizar lista de opciones
- `useUserMenu`: Gestionar navegación y acciones
- `useUserInitials`: Generar iniciales del usuario

### 2. Open/Closed Principle (OCP)
- **Abierto para extensión**: Puedes agregar nuevas opciones al menú sin modificar componentes existentes
- **Cerrado para modificación**: La configuración está en `menu.constants.ts`

```typescript
// Fácil agregar nuevas rutas sin cambiar componentes
export const ROUTE_PATHS = {
  PROFILE: "/dashboard/perfil",
  SETTINGS: "/dashboard/configuracion",
  ADMIN: "/dashboard/admin", // Nueva ruta
}
```

### 3. Liskov Substitution Principle (LSP)
Los componentes pueden sustituirse por sus abstracciones sin romper funcionalidad:

```typescript
// UserAvatar acepta cualquier string de iniciales
<UserAvatar initials="AB" />
<UserAvatar initials={generatedInitials} />
```

### 4. Interface Segregation Principle (ISP)
Interfaces específicas y no sobrecargadas:

```typescript
// Solo las propiedades necesarias
interface UserAvatarProps {
  initials: string
  className?: string
}

interface UserInfoProps {
  user: User | null
  t: (key: string) => string
}
```

### 5. Dependency Inversion Principle (DIP)
Los componentes dependen de **abstracciones** (hooks, tipos) no de implementaciones concretas:

```typescript
// UserMenu depende de hooks abstraídos
const initials = useUserInitials(user)
const { menuOptions } = useUserMenu({ user, logout, t })
```

## 🎨 Patrones de Diseño

### 1. Composition Pattern
Los componentes se componen en lugar de heredarse:

```typescript
<UserMenu>
  <UserAvatar />
  <UserInfo />
  <UserMenuItems />
</UserMenu>
```

### 2. Custom Hooks Pattern
Lógica reutilizable extraída en hooks:

```typescript
// Encapsula lógica compleja
const { menuOptions, handleLogout } = useUserMenu({ user, logout, t })
```

### 3. Barrel Pattern
Exports centralizados para imports limpios:

```typescript
// Antes
import { UserMenu } from "@/components/Header/components/UserMenu"
import { useUserMenu } from "@/components/Header/hooks/useUserMenu"

// Después
import { UserMenu, useUserMenu } from "@/components/Header"
```

### 4. Factory Pattern (en hooks)
`useUserMenu` actúa como factory de opciones del menú:

```typescript
const menuOptions: UserMenuOption[] = useMemo(() => [
  { id: "profile", label: t("common.profile"), ... },
  { id: "settings", label: t("common.settings"), ... },
], [t, navigateToProfile, navigateToSettings])
```

## 🧹 Clean Code Aplicado

### Nombres Descriptivos
```typescript
// ❌ Antes
const getInitials = () => { ... }

// ✅ Después
export function useUserInitials(user: User | null): string
```

### Funciones Pequeñas
Cada función hace **una cosa bien**:

```typescript
// Solo genera iniciales
export function useUserInitials(user: User | null): string {
  return useMemo(() => {
    if (!user) return DEFAULT_INITIALS
    if (user.username) return user.username.substring(0, 2).toUpperCase()
    if (user.email) return user.email.substring(0, 2).toUpperCase()
    return DEFAULT_INITIALS
  }, [user])
}
```

### Sin Números Mágicos
```typescript
// ❌ Antes
user.username.substring(0, 2)

// ✅ Después
export const INITIALS_LENGTH = 2
user.username.substring(0, INITIALS_LENGTH)
```

### Comentarios JSDoc
```typescript
/**
 * Custom hook to generate user initials
 * Single Responsibility: Only handles initials generation logic
 */
export function useUserInitials(user: User | null): string
```

## 🎯 Beneficios de la Refactorización

### ✅ Mantenibilidad
- Código modular y fácil de entender
- Cambios localizados en módulos específicos
- Testing unitario más sencillo

### ✅ Reutilización
- Componentes y hooks reutilizables
- Lógica desacoplada de la UI

### ✅ Escalabilidad
- Fácil agregar nuevas características
- Estructura clara para el crecimiento

### ✅ Testabilidad
```typescript
// Hooks puros fáciles de testear
test('useUserInitials returns correct initials', () => {
  const user = { username: 'John Doe' }
  const initials = useUserInitials(user)
  expect(initials).toBe('JO')
})
```

### ✅ Type Safety
```typescript
// TypeScript evita errores en tiempo de compilación
interface UserMenuOption {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "destructive"
}
```

## 🚀 Uso del Componente

```typescript
// Simple y limpio
import { UserMenu } from "@/components/Header"

export function MyHeader() {
  return (
    <header>
      <UserMenu />
    </header>
  )
}
```

## 🔄 Integración con Auth Store

El componente está **totalmente integrado** con tu auth store. NO requiere un objeto `user` completo, trabaja directamente con `userId` y `role`.

### Estructura del Auth Store
```typescript
interface AuthState {
  userId: number | null      // ID del usuario
  role: string | null        // Rol: "admin", "editor", "visitante"
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  logout: () => Promise<void>
}
```

### Cómo se integra el UserMenu
```typescript
export function UserMenu() {
  // Extrae directamente userId, role y logout del store
  const { userId, role, logout } = useAuthStore()
  const { t } = useTranslation()
  
  // Genera iniciales basadas en userId (ej: ID 123 -> "U1")
  const initials = useUserInitials(userId)
  
  // Obtiene las opciones del menú
  const { menuOptions } = useUserMenu({ logout, t })

  return (
    <DropdownMenu>
      {/* ... */}
      <UserInfo userId={userId} role={role} t={t} />
      {/* ... */}
    </DropdownMenu>
  )
}
```

### Generación de Iniciales
Como tu auth store solo tiene `userId` (número) y no `username`, las iniciales se generan así:

```typescript
// useUserInitials.ts
export function useUserInitials(userId: number | null): string {
  return useMemo(() => {
    if (!userId) return "U"  // Usuario no autenticado
    
    // Genera iniciales desde el ID
    // ID 123 -> "U1"
    // ID 456 -> "U4"
    const firstDigit = userId.toString().charAt(0)
    return `U${firstDigit}`
  }, [userId])
}
```

### Display de Información del Usuario
```typescript
// UserInfo.tsx
export function UserInfo({ userId, role, t }: UserInfoProps) {
  // Muestra "Usuario #123" o "Invitado"
  const displayName = userId 
    ? `${t("common.user")} #${userId}` 
    : t("common.guest")
  
  // Traduce el rol si existe
  const roleDisplay = role ? t(`roles.${role}`) : ""

  return (
    <div>
      <p>{displayName}</p>
      {roleDisplay && <p>{roleDisplay}</p>}
    </div>
  )
}
```

### Traducciones Requeridas

Agrega estas claves en tus archivos de traducción:

```json
// es.json
{
  "common": {
    "user": "Usuario",
    "guest": "Invitado",
    "userMenu": "Menú de usuario",
    "profile": "Perfil",
    "settings": "Configuración",
    "logout": "Cerrar sesión"
  },
  "roles": {
    "admin": "Administrador",
    "editor": "Editor",
    "visitante": "Visitante"
  }
}
```

### Flujo de Logout
```typescript
// useUserMenu.ts
const handleLogout = useCallback(async () => {
  // Llama al método async del store
  await logout()
  
  // Redirige al login
  router.push(ROUTE_PATHS.LOGIN)
}, [logout, router])
```

### ¿Por qué esta estructura?

✅ **Aligned con tu store**: No intenta acceder a propiedades que no existen  
✅ **Simple**: Menos datos = menos complejidad  
✅ **Eficiente**: No requiere llamadas extra al API para info del usuario  
✅ **Flexible**: Fácil actualizar si en el futuro agregas más campos



## 📚 Referencias

- **SOLID Principles**: Robert C. Martin
- **Clean Code**: Robert C. Martin
- **React Design Patterns**: Composition over Inheritance
- **Custom Hooks**: React Best Practices
