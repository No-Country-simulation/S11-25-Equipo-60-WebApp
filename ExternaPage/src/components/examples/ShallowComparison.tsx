/**
 * Ejemplos comparativos: CON y SIN useShallow
 * Este archivo demuestra la diferencia de performance entre usar useShallow y no usarlo
 */

'use client';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore, selectUserData, selectTokens } from '@/stores/auth/auth.store';

// ============================================
// ❌ MAL: Sin useShallow - Re-renders innecesarios
// ============================================
export function UserInfoBad() {
  // ⚠️ PROBLEMA: Esto crea un nuevo objeto en cada render
  // Zustand compara con Object.is(), entonces siempre detecta cambio
  // Resultado: Re-render en CADA actualización del store, aunque userId y role no cambien
  const { userId, role } = useAuthStore((state) => ({
    userId: state.userId,
    role: state.role,
  }));

  console.log('❌ UserInfoBad re-render'); // Se ejecuta muchas veces

  return (
    <div>
      <h3>Usuario (Sin useShallow)</h3>
      <p>ID: {userId}</p>
      <p>Rol: {role}</p>
    </div>
  );
}

// ============================================
// ✅ BIEN: Con useShallow - Re-renders optimizados
// ============================================
export function UserInfoGood() {
  // ✅ SOLUCIÓN: useShallow hace comparación superficial
  // Solo re-renderiza si userId o role REALMENTE cambian
  const { userId, role } = useAuthStore(
    useShallow((state) => ({
      userId: state.userId,
      role: state.role,
    }))
  );

  console.log('✅ UserInfoGood re-render'); // Solo cuando userId o role cambien

  return (
    <div>
      <h3>Usuario (Con useShallow)</h3>
      <p>ID: {userId}</p>
      <p>Rol: {role}</p>
    </div>
  );
}

// ============================================
// ✅ MEJOR: Con selector predefinido
// ============================================
export function UserInfoBest() {
  // ✅✅ MEJOR PRÁCTICA: Usar selector predefinido con useShallow
  // Más limpio, reutilizable y optimizado
  const { userId, role } = useAuthStore(useShallow(selectUserData));

  console.log('✅✅ UserInfoBest re-render'); // Solo cuando los datos cambien

  return (
    <div>
      <h3>Usuario (Con selector predefinido)</h3>
      <p>ID: {userId}</p>
      <p>Rol: {role}</p>
    </div>
  );
}

// ============================================
// Ejemplo: Múltiples selectores con useShallow
// ============================================
export function CompleteUserInfo() {
  // ✅ Combinar múltiples selectores optimizados
  const { userId, role } = useAuthStore(useShallow(selectUserData));
  const { accessToken, refreshToken } = useAuthStore(useShallow(selectTokens));

  // Solo re-renderiza cuando cambian los valores específicos que usa
  console.log('✅ CompleteUserInfo re-render');

  return (
    <div>
      <h3>Información Completa</h3>
      <p>Usuario ID: {userId}</p>
      <p>Rol: {role}</p>
      <p>Token: {accessToken ? '✓ Válido' : '✗ Inválido'}</p>
      <p>Refresh: {refreshToken ? '✓ Disponible' : '✗ No disponible'}</p>
    </div>
  );
}

// ============================================
// Comparación: Valores primitivos vs objetos
// ============================================

// ✅ BIEN: Valores primitivos no necesitan useShallow
export function JustUserId() {
  // Seleccionar un solo valor primitivo es eficiente sin useShallow
  const userId = useAuthStore((state) => state.userId);

  console.log('✅ JustUserId re-render'); // Solo cuando userId cambie

  return <div>Usuario ID: {userId}</div>;
}

// ❌ PROBLEMA: Array/Objeto sin useShallow
export function UserTokensBad() {
  // ⚠️ PROBLEMA: Devuelve un array nuevo en cada render
  const tokens = useAuthStore((state) => [state.accessToken, state.refreshToken]);

  console.log('❌ UserTokensBad re-render'); // Re-render en cada cambio del store

  return (
    <div>
      <p>Access: {tokens[0]}</p>
      <p>Refresh: {tokens[1]}</p>
    </div>
  );
}

// ✅ SOLUCIÓN: Array con useShallow
export function UserTokensGood() {
  // ✅ useShallow compara los elementos del array
  const tokens = useAuthStore(
    useShallow((state) => [state.accessToken, state.refreshToken])
  );

  console.log('✅ UserTokensGood re-render'); // Solo cuando los tokens cambien

  return (
    <div>
      <p>Access: {tokens[0]}</p>
      <p>Refresh: {tokens[1]}</p>
    </div>
  );
}

// ============================================
// Ejemplo de Testing: Componente con contador de renders
// ============================================
export function RenderCounter() {
  const { userId, role } = useAuthStore(useShallow(selectUserData));
  const renderCount = React.useRef(0);

  React.useEffect(() => {
    renderCount.current += 1;
  });

  return (
    <div style={{ border: '2px solid blue', padding: '10px', margin: '10px' }}>
      <h4>Contador de Re-renders</h4>
      <p>Este componente se ha renderizado: <strong>{renderCount.current}</strong> veces</p>
      <p>Usuario: {userId} - Rol: {role}</p>
      <small>
        💡 Tip: Abre la consola y observa cuántas veces se re-renderiza cuando
        actualizas otros campos del store (como isLoading o error)
      </small>
    </div>
  );
}

// ============================================
// Demo interactivo para probar re-renders
// ============================================
export function RenderDemo() {
  const { userId, role } = useAuthStore(useShallow(selectUserData));
  const { loginUser, logout } = useAuthStore(
    useShallow((state) => ({
      loginUser: state.loginUser,
      logout: state.logout,
    }))
  );

  // Función para simular cambios en el store
  const triggerOtherStateChange = () => {
    // Esto NO debería causar re-render en componentes que usan useShallow
    // porque solo están suscritos a userId y role
    console.log('Simulando cambio en otro campo del store...');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>Demo de useShallow</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>Datos actuales:</h3>
        <p>Usuario ID: {userId || 'No logueado'}</p>
        <p>Rol: {role || 'N/A'}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => loginUser({ email: 'test@test.com', password: '123456' })}
          style={{ padding: '10px' }}
        >
          Simular Login (cambia userId y role)
        </button>

        <button
          onClick={logout}
          style={{ padding: '10px' }}
        >
          Logout (limpia userId y role)
        </button>

        <button
          onClick={triggerOtherStateChange}
          style={{ padding: '10px', background: '#f0f0f0' }}
        >
          Cambiar otro campo (NO debería re-renderizar)
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f9f9f9' }}>
        <h3>Componentes observados:</h3>
        <p>Abre la consola y observa los logs de re-render al hacer clic en los botones</p>

        <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
          <UserInfoBad />
          <UserInfoGood />
          <UserInfoBest />
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd' }}>
        <h4>📊 Resultado esperado:</h4>
        <ul>
          <li>❌ <strong>UserInfoBad</strong>: Re-render en CADA acción</li>
          <li>✅ <strong>UserInfoGood</strong>: Re-render solo en Login/Logout</li>
          <li>✅✅ <strong>UserInfoBest</strong>: Re-render solo en Login/Logout</li>
        </ul>
      </div>
    </div>
  );
}

// Importar React para useRef
import * as React from 'react';
