/**
 * Ejemplo REFACTORIZADO de Header usando mejores prácticas de Zustand
 * - Usa selectores optimizados para evitar re-renders innecesarios
 * - Usa useShallow para comparación superficial de objetos
 * - Separa acciones del estado para mejor performance
 */

'use client';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore, selectIsLoggedIn, selectUserData } from '@/store/auth/auth.store';

export default function Header() {
  // ✅ MEJOR PRÁCTICA: Usar selector para verificar login
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  // ✅ MEJOR PRÁCTICA: Usar useShallow para objetos (evita re-renders innecesarios)
  const { role, userId } = useAuthStore(useShallow(selectUserData));

  return (
    <header className="header">
      <div className="logo">
        <Link href="/">Mi App</Link>
      </div>

      <nav className="nav">
        {/* Mostrar diferentes elementos según el estado de login */}
        {isLoggedIn ? (
          // Usuario SÍ está logueado - Mostrar menú de usuario
          <UserMenu role={role} userId={userId} />
        ) : (
          // Usuario NO está logueado - Mostrar botones de login y registro
          <div className="auth-buttons">
            <Link href="/login">
              <button className="btn-login">Iniciar Sesión</button>
            </Link>
            <Link href="/register">
              <button className="btn-register">Registrarse</button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

// Componente del menú de usuario
function UserMenu({ role, userId }: Readonly<{ role: string | null; userId: number | null }>) {
  // ✅ MEJOR PRÁCTICA: Seleccionar solo la acción necesaria
  // Las funciones nunca cambian, por lo que no causan re-renders
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    globalThis.location.href = '/'; // Redirigir al home después de logout
  };

  return (
    <div className="user-menu">
      <div className="user-info">
        <span className="user-role">
          {role === 'administrador' && '👑 Admin'}
          {role === 'editor' && '✏️ Editor'}
          {role === 'visitante' && '👤 Visitante'}
        </span>
        <span className="user-id">ID: {userId}</span>
      </div>

      <div className="menu-dropdown">
        <Link href="/profile">
          <button>Mi Perfil</button>
        </Link>
        <Link href="/settings">
          <button>Configuración</button>
        </Link>
        {role === 'administrador' && (
          <Link href="/admin">
            <button>Panel Admin</button>
          </Link>
        )}
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
