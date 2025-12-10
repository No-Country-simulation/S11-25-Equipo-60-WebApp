import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDBStorage } from "@/store/adapters";
import { executeAsyncAction } from "@/store/helpers/async-action.helper";
import { 
  getVisitante, 
  getEditor, 
  getAdministrador,
  updateVisitante,
  updateEditor,
  updateAdministrador 
} from "@/api";
import type { Usuario } from "@/interfaces";

/**
 * User Store - Gestión del perfil del usuario autenticado
 * 
 * Arquitectura:
 * - Strategy Pattern: ROLE_ENDPOINTS para mapeo rol → endpoints
 * - Separation of Concerns: Lógica de negocio separada del manejo de estado
 * - DRY: executeAsyncAction helper para eliminar código repetitivo
 * - Type Safety: Genéricos para inferencia correcta de tipos
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo gestiona datos de perfil
 * - Open/Closed: Extensible agregando roles sin modificar lógica
 * - Interface Segregation: Separa estado de acciones
 * - Dependency Inversion: Depende de abstracciones (Usuario interface)
 */

// ============================================
// STRATEGY PATTERN - Role-based endpoint mapping
// ============================================

type RoleEndpoints = {
  fetch: (id: number) => ReturnType<typeof getVisitante>;
  update: (id: number, data: Partial<Usuario>) => ReturnType<typeof updateVisitante>;
};

const ROLE_ENDPOINTS: Record<string, RoleEndpoints> = {
  visitante: {
    fetch: getVisitante,
    update: updateVisitante,
  },
  editor: {
    fetch: getEditor,
    update: updateEditor,
  },
  administrador: {
    fetch: getAdministrador,
    update: updateAdministrador,
  },
};

/**
 * Obtiene los endpoints correspondientes al rol
 * @throws Error si el rol no existe
 */
const getRoleEndpoints = (role: string): RoleEndpoints => {
  const endpoints = ROLE_ENDPOINTS[role];
  if (!endpoints) {
    throw new Error(`Rol desconocido: ${role}`);
  }
  return endpoints;
};

// ============================================
// INTERFACES
// ============================================

interface UserStateData {
  profile: Usuario | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  fetchProfile: (userId: number, role: string) => Promise<void>;
  updateProfile: (userId: number, role: string, data: Partial<Usuario>) => Promise<void>;
  clearProfile: () => void;
  clearError: () => void;
}

type UserState = UserStateData & UserActions;

// ============================================
// STORE
// ============================================

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Estado inicial
      profile: null,
      isLoading: false,
      error: null,

      /**
       * Fetch Profile - Obtiene el perfil según el rol
       * Usa executeAsyncAction helper para manejo automático de estado
       */
      fetchProfile: async (userId: number, role: string) => {
        await executeAsyncAction<Usuario, UserState>(
          set,
          () => getRoleEndpoints(role).fetch(userId),
          'fetchProfile',
          (profile) => ({ profile }),
          () => ({ profile: null }) // Limpiar profile en caso de error
        );
      },

      /**
       * Update Profile - Actualiza el perfil según el rol
       * Usa executeAsyncAction helper para manejo automático de estado
       */
      updateProfile: async (userId: number, role: string, data: Partial<Usuario>) => {
        await executeAsyncAction<Usuario, UserState>(
          set,
          () => getRoleEndpoints(role).update(userId, data),
          'updateProfile',
          (profile) => ({ profile })
          // No limpiamos profile en error para mantener datos anteriores
        );
      },

      /**
       * Clear Profile - Limpia el perfil (usado en logout)
       */
      clearProfile: () => {
        set({
          profile: null,
          error: null,
          isLoading: false,
        });
      },

      /**
       * Clear Error - Limpia errores manualmente
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "user-storage", // Nombre único en IndexedDB
      storage: createJSONStorage(() => indexedDBStorage),
      // Partializar: Solo persistir el profile, no el loading ni errors
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);
