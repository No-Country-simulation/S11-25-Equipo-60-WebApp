import { useAuthStore } from "@/store/auth/auth.store";
import { useUserStore } from "@/store/user/user.store";

/**
 * Hook de autenticación con integración de User Store
 * Facade Pattern: Simplifica la interacción con múltiples stores
 * 
 * Ventajas:
 * - Evita dependencia circular entre stores
 * - Centraliza la lógica de login/logout
 * - Facilita cambios futuros (ej: agregar analytics)
 */

export const useAuth = () => {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  /**
   * Login con auto-fetch del perfil
   */
  const login = async (credentials: { email: string; password: string; username?: string }) => {
    // 1. Autenticar
    await authStore.loginUser(credentials);

    // 2. Obtener perfil automáticamente
    const { userId, role } = useAuthStore.getState();
    if (userId && role) {
      try {
        await userStore.fetchProfile(userId, role);
      } catch (error) {
        console.warn('⚠️ No se pudo cargar el perfil:', error);
        // No bloquear el login si falla el perfil
      }
    }
  };

  /**
   * Logout con limpieza del perfil
   */
  const logout = async () => {
    // 1. Limpiar perfil primero
    userStore.clearProfile();

    // 2. Cerrar sesión
    await authStore.logout();
  };

  return {
    // Auth state
    userId: authStore.userId,
    role: authStore.role,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading || userStore.isLoading,
    error: authStore.error || userStore.error,

    // User profile
    profile: userStore.profile,

    // Actions
    login,
    logout,
    register: authStore.registerUser,
    clearError: () => {
      authStore.clearError();
      userStore.clearError();
    },
  };
};
