import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { login, register, logout as logoutApi, refreshToken as refreshTokenApi } from "@/api";
import { indexedDBStorage } from "@/store/adapters";
import type { UserCredentials, Usuario, LoginResponse, RegisterResponse } from "@/interfaces";

/**
 * IMPORTANTE: No importar useUserStore directamente aquí para evitar dependencias circulares
 * La integración se hace desde el componente/hook que llama loginUser/logout
 */

// Separar el estado de las acciones para mejor organización
interface AuthStateData {
  userId: number | null;
  role: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  loginUser: (credentials: UserCredentials) => Promise<void>;
  registerUser: (data: Usuario) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

type AuthState = AuthStateData & AuthActions;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      userId: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login - Llama al API path y actualiza estado
      loginUser: async (credentials: UserCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const result = await login(credentials);

          // Validar si es un error
          if ('success' in result && result.success === false) {
            throw new Error(result.message);
          }

          // Es una respuesta exitosa
          const response = result as LoginResponse;

          set({
            userId: response.user_id,
            role: response.rol,
            accessToken: response.access,
            refreshToken: response.refresh || null,
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

      // Register - Llama al API path y actualiza estado
      registerUser: async (data: Usuario) => {
        set({ isLoading: true, error: null });

        try {
          const result = await register(data);

          // Validar si es un error
          if ('success' in result && result.success === false) {
            throw new Error(result.message);
          }

          // Es una respuesta exitosa
          const response = result as RegisterResponse;

          set({
            isLoading: false,
            error: null,
          });

          // Nota: Después del registro, el usuario debe hacer login
          console.log('✅ Usuario registrado exitosamente:', response.username);
        } catch (error: any) {
          const errorMessage = error.message || 'Error al registrar usuario';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      // Logout - Llama al API path (opcional) y limpia estado
      logout: async () => {
        try {
          // Intentar hacer logout en el backend (opcional)
          await logoutApi();
        } catch (error) {
          console.warn('Error al hacer logout en el servidor:', error);
        } finally {
          // Limpiar estado local (siempre se ejecuta)
          set({
            userId: null,
            role: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Refresh - Renueva el access token
      refresh: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('No hay refresh token disponible');
        }

        try {
          const result = await refreshTokenApi(refreshToken);

          // Validar si es un error
          if ('success' in result && result.success === false) {
            // Token inválido o expirado - cerrar sesión
            await get().logout();
            throw new Error(result.message);
          }

          // Es una respuesta exitosa
          const response = result as { access: string };

          set({
            accessToken: response.access,
          });
        } catch (error: any) {
          // Si falla el refresh, cerrar sesión
          await get().logout();
          throw error;
        }
      },

      // Limpiar error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // Nombre único para IndexedDB
      storage: createJSONStorage(() => indexedDBStorage),
      // Solo persistir los datos necesarios
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================
// Selectores Helper - Mejor práctica de Zustand
// ============================================

/**
 * Selectores optimizados para usar en componentes.
 * Evitan re-renders innecesarios seleccionando solo lo necesario.
 */

// Selector para verificar si está logueado (más común)
export const selectIsLoggedIn = (state: AuthState) =>
  !!(state.isAuthenticated && state.accessToken && state.userId);

// Selector para datos del usuario
export const selectUserData = (state: AuthState) => ({
  userId: state.userId,
  role: state.role,
  isAuthenticated: state.isAuthenticated,
});

// Selector para tokens
export const selectTokens = (state: AuthState) => ({
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
});

// Selector para estado error
export const selectLoadingState = (state: AuthState) => ({
  isLoading: state.isLoading,
  error: state.error,
});

// Selector solo para acciones (nunca cambia, evita re-renders)
export const selectAuthActions = (state: AuthState) => ({
  loginUser: state.loginUser,
  registerUser: state.registerUser,
  logout: state.logout,
  refresh: state.refresh,
  clearError: state.clearError,
});
