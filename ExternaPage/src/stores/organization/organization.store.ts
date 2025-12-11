import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDBStorage } from "@/stores";
import {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  addEditors,
  addVisitors,
  getApprovedTestimonials
} from "@/api";
import { validateApiResponse } from "@/core";
import type { Organizacion, TestimonioAprobado } from "@/interfaces";
interface OrganizationStateData {
  organizations: Organizacion[];
  currentOrganization: Organizacion | null;
  approvedTestimonials: TestimonioAprobado[];
  isLoading: boolean;
  error: string | null;
}
interface OrganizationActions {
  fetchOrganizations: () => Promise<void>;
  fetchOrganization: (id: number) => Promise<void>;
  createOrganization: (data: { organizacion_nombre: string; dominio: string }) => Promise<void>;
  updateOrganization: (id: number, data: { organizacion_nombre?: string; dominio?: string }) => Promise<void>;
  deleteOrganization: (id: number) => Promise<void>;
  addEditors: (orgId: number, editorIds: number[]) => Promise<void>;
  addVisitors: (orgId: number, visitorIds: number[]) => Promise<void>;
  fetchApprovedTestimonials: (orgId: number) => Promise<void>;
  clearCurrent: () => void;
  clearError: () => void;
}

type OrganizationState = OrganizationStateData & OrganizationActions;

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      organizations: [],
      currentOrganization: null,
      approvedTestimonials: [],
      isLoading: false,
      error: null,

  // Obtener todas las organizaciones
  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await getOrganizations();
      const organizations = validateApiResponse<Organizacion[]>(result, '[fetchOrganizations]');

      set({
        organizations,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al obtener organizaciones'
      });
    }
  },

  // Obtener organización por ID
  fetchOrganization: async (id: number) => {
    set({ isLoading: true, error: null });

    try {
      const result = await getOrganizationById(id);
      const organization = validateApiResponse<Organizacion>(result, `[fetchOrganization ${id}]`);

      set({
        currentOrganization: organization,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || `Error al obtener organización ${id}`
      });
    }
  },

  // Crear organización
  createOrganization: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const result = await createOrganization(data);
      const newOrganization = validateApiResponse<Organizacion>(result, '[createOrganization]');

      set({
        organizations: [...get().organizations, newOrganization],
        currentOrganization: newOrganization,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al crear organización'
      });
    }
  },

  // Actualizar organización
  updateOrganization: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const result = await updateOrganization(id, data);
      const updatedOrganization = validateApiResponse<Organizacion>(result, `[updateOrganization ${id}]`);

      set({
        organizations: get().organizations.map(org =>
          org.id === id ? updatedOrganization : org
        ),
        currentOrganization: get().currentOrganization?.id === id ? updatedOrganization : get().currentOrganization,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || `Error al actualizar organización ${id}`
      });
    }
  },

  // Eliminar organización
  deleteOrganization: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const result = await deleteOrganization(id);
      validateApiResponse(result, `[deleteOrganization ${id}]`);

      set({
        organizations: get().organizations.filter(org => org.id !== id),
        currentOrganization: get().currentOrganization?.id === id ? null : get().currentOrganization,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || `Error al eliminar organización ${id}`
      });
    }
  },

  // Agregar editores a organización
  addEditors: async (orgId, editorIds) => {
    set({ isLoading: true, error: null });

    try {
      const result = await addEditors(orgId, editorIds);
      validateApiResponse(result, `[addEditors ${orgId}]`);

      // Refrescar la organización actual si coincide
      if (get().currentOrganization?.id === orgId) {
        await get().fetchOrganization(orgId);
      }

      set({ isLoading: false, error: null });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || `Error al agregar editores a organización ${orgId}`
      });
    }
  },

  // Agregar visitantes a organización
  addVisitors: async (orgId, visitorIds) => {
    set({ isLoading: true, error: null });

    try {
      const result = await addVisitors(orgId, visitorIds);
      validateApiResponse(result, `[addVisitors ${orgId}]`);

      // Refrescar la organización actual si coincide
      if (get().currentOrganization?.id === orgId) {
        await get().fetchOrganization(orgId);
      }

      set({ isLoading: false, error: null });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || `Error al agregar visitantes a organización ${orgId}`
      });
    }
  },

  // Obtener testimonios aprobados de organización
  fetchApprovedTestimonials: async (orgId) => {
    set({ isLoading: true, error: null });

    try {
      const result = await getApprovedTestimonials(orgId);
      const testimonials = validateApiResponse<TestimonioAprobado[]>(result, `[fetchApprovedTestimonials ${orgId}]`);

      set({
        approvedTestimonials: testimonials,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || `Error al obtener testimonios aprobados de organización ${orgId}`
      });
    }
  },

  // Limpiar organización actual
  clearCurrent: () => {
    set({
      currentOrganization: null,
      approvedTestimonials: []
    });
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  }
    }),
    {
      name: 'organization-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        organizations: state.organizations
      })
    }
  )
);
