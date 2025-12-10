/**
 * Ejemplos REFACTORIZADOS con mejores prácticas de Zustand
 * - Usa useShallow para comparación superficial
 * - Selectores optimizados para evitar re-renders
 * - Separación de acciones y estado
 */

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import {
  useAuthStore,
  selectIsLoggedIn,
  selectUserData
} from '@/store';

// ============================================
// Ejemplo 1: Redirigir según estado de login
// ============================================
export function LoginPage() {
  const router = useRouter();
  // ✅ MEJOR PRÁCTICA: Usar selector optimizado
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  useEffect(() => {
    // Si ya está logueado, redirigir al dashboard
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return <div>Redirigiendo...</div>;
  }

  return <LoginForm />;
}

// ============================================
// Ejemplo 2: Mostrar contenido condicional
// ============================================
export function HomePage() {
  // ✅ MEJOR PRÁCTICA: Selector simple para boolean
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  return (
    <div>
      <h1>Bienvenido a nuestra aplicación</h1>

      {isLoggedIn ? (
        <div>
          <h2>¡Hola de nuevo! 👋</h2>
          <p>Continúa donde lo dejaste</p>
          <button>Ir al Dashboard</button>
        </div>
      ) : (
        <div>
          <h2>Comienza ahora</h2>
          <p>Regístrate para acceder a todas las funciones</p>
          <button>Crear cuenta gratis</button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Ejemplo 3: Componente de navegación responsive
// ============================================
export function MobileNav() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  // ✅ MEJOR PRÁCTICA: useShallow para evitar re-render cuando otros campos cambien
  const { role } = useAuthStore(useShallow(selectUserData));
  // ✅ MEJOR PRÁCTICA: Seleccionar solo la acción necesaria
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav className="mobile-nav">
      <a href="/">Inicio</a>
      <a href="/about">Acerca de</a>

      {isLoggedIn ? (
        <>
          <a href="/dashboard">Dashboard</a>
          {role === 'administrador' && <a href="/admin">Admin</a>}
          <button onClick={() => logout()}>Salir</button>
        </>
      ) : (
        <>
          <a href="/login">Ingresar</a>
          <a href="/register">Registrarse</a>
        </>
      )}
    </nav>
  );
}

// ============================================
// Ejemplo 4: Hook personalizado para auth OPTIMIZADO
// ============================================
export function useAuth() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  // ✅ MEJOR PRÁCTICA: useShallow para obtener múltiples valores sin re-renders innecesarios
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

// Uso del hook personalizado
export function ProtectedPage() {
  const { isLoggedIn, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/unauthorized');
    }
  }, [isLoggedIn, isAdmin, router]);

  if (!isLoggedIn || !isAdmin) {
    return <div>Verificando permisos...</div>;
  }

  return <AdminPanel />;
}

// ============================================
// Ejemplo 5: Botón inteligente según estado
// ============================================
export function SmartActionButton() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const router = useRouter();

  const handleAction = () => {
    if (isLoggedIn) {
      // Usuario logueado - hacer la acción
      console.log('Realizando acción...');
    } else {
      // Usuario no logueado - redirigir a login
      router.push('/login?redirect=/action');
    }
  };

  return (
    <button onClick={handleAction}>
      {isLoggedIn ? 'Realizar Acción' : 'Inicia sesión para continuar'}
    </button>
  );
}

// Placeholder components
function LoginForm() { return <div>Login Form</div>; }
function AdminPanel() { return <div>Admin Panel</div>; }
