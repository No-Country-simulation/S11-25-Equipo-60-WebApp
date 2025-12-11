import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDBStorage } from "@/stores";
import { 
  getTestimonials, 
  getTestimonialById, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  changeTestimonialState,
  getOwnTestimonials,
  addFeedbackToTestimonial
} from "@/api";
import { validateApiResponse } from "@/core";
import type { Testimonio } from "@/interfaces";

interface TestimonialStateData {
  testimonials: Testimonio[];
  ownTestimonials: Testimonio[];
  currentTestimonial: Testimonio | null;
  isLoading: boolean;
  error: string | null;
}

interface TestimonialActions {
  fetchTestimonials: () => Promise<void>;
  fetchTestimonial: (id: number) => Promise<void>;
  fetchOwnTestimonials: () => Promise<void>;
  createTestimonial: (data: Partial<Testimonio> | FormData) => Promise<void>;
  updateTestimonial: (id: number, data: Partial<Testimonio>) => Promise<void>;
  deleteTestimonial: (id: number) => Promise<void>;
  changeState: (id: number, estado: string, feedback?: string) => Promise<void>;
  addFeedback: (id: number, feedback: string) => Promise<void>;
  clearCurrent: () => void;
  clearError: () => void;
}

type TestimonialState = TestimonialStateData & TestimonialActions;

export const useTestimonialStore = create<TestimonialState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      testimonials: [],
      ownTestimonials: [],
      currentTestimonial: null,
      isLoading: false,
      error: null,

      // Obtener todos los testimonios públicos (aprobados)
      fetchTestimonials: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await getTestimonials();
          const testimonials = validateApiResponse<Testimonio[]>(result, '[fetchTestimonials]');

          set({
            testimonials,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al obtener testimonios'
          });
        }
      },

      // Obtener testimonio por ID
      fetchTestimonial: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
          const result = await getTestimonialById(id);
          const testimonial = validateApiResponse<Testimonio>(result, `[fetchTestimonial ${id}]`);

          set({
            currentTestimonial: testimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al obtener testimonio ${id}`
          });
        }
      },

      // Obtener testimonios propios según rol (editores: sus organizaciones, visitantes: propios)
      fetchOwnTestimonials: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await getOwnTestimonials();
          const ownTestimonials = validateApiResponse<Testimonio[]>(result, '[fetchOwnTestimonials]');

          set({
            ownTestimonials,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al obtener testimonios propios'
          });
        }
      },

      // Crear testimonio
      createTestimonial: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const result = await createTestimonial(data);
          const newTestimonial = validateApiResponse<Testimonio>(result, '[createTestimonial]');

          set({
            testimonials: [...get().testimonials, newTestimonial],
            ownTestimonials: [...get().ownTestimonials, newTestimonial],
            currentTestimonial: newTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al crear testimonio'
          });
          throw error; // Re-lanzar para que el componente pueda manejarlo
        }
      },

      // Actualizar testimonio
      updateTestimonial: async (id, data) => {
        set({ isLoading: true, error: null });

        try {
          const result = await updateTestimonial(id, data);
          const updatedTestimonial = validateApiResponse<Testimonio>(result, `[updateTestimonial ${id}]`);

          set({
            testimonials: get().testimonials.map(testimonial => 
              testimonial.id === id ? updatedTestimonial : testimonial
            ),
            ownTestimonials: get().ownTestimonials.map(testimonial => 
              testimonial.id === id ? updatedTestimonial : testimonial
            ),
            currentTestimonial: get().currentTestimonial?.id === id ? updatedTestimonial : get().currentTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al actualizar testimonio ${id}`
          });
          throw error; // Re-lanzar para que el componente pueda manejarlo
        }
      },

      // Eliminar testimonio
      deleteTestimonial: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const result = await deleteTestimonial(id);
          validateApiResponse(result, `[deleteTestimonial ${id}]`);

          set({
            testimonials: get().testimonials.filter(testimonial => testimonial.id !== id),
            ownTestimonials: get().ownTestimonials.filter(testimonial => testimonial.id !== id),
            currentTestimonial: get().currentTestimonial?.id === id ? null : get().currentTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al eliminar testimonio ${id}`
          });
        }
      },

      // Cambiar estado de testimonio (solo editores/admin)
      changeState: async (id: number, estado: string, feedback?: string) => {
        set({ isLoading: true, error: null });

        try {
          const result = await changeTestimonialState(id, estado, feedback);
          const updatedTestimonial = validateApiResponse<Testimonio>(result, `[changeState ${id}]`);

          set({
            testimonials: get().testimonials.map(testimonial => 
              testimonial.id === id ? updatedTestimonial : testimonial
            ),
            ownTestimonials: get().ownTestimonials.map(testimonial => 
              testimonial.id === id ? updatedTestimonial : testimonial
            ),
            currentTestimonial: get().currentTestimonial?.id === id ? updatedTestimonial : get().currentTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al cambiar estado de testimonio ${id}`
          });
          throw error; // Re-lanzar para que el componente pueda manejarlo
        }
      },

      // Agregar feedback a testimonio (cambia automáticamente a RECHAZADO)
      addFeedback: async (id: number, feedback: string) => {
        set({ isLoading: true, error: null });

        try {
          const result = await addFeedbackToTestimonial(id, feedback);
          const updatedTestimonial = validateApiResponse<Testimonio>(result, `[addFeedback ${id}]`);

          set({
            testimonials: get().testimonials.map(testimonial => 
              testimonial.id === id ? updatedTestimonial : testimonial
            ),
            ownTestimonials: get().ownTestimonials.map(testimonial => 
              testimonial.id === id ? updatedTestimonial : testimonial
            ),
            currentTestimonial: get().currentTestimonial?.id === id ? updatedTestimonial : get().currentTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al agregar feedback a testimonio ${id}`
          });
          throw error; // Re-lanzar para que el componente pueda manejarlo
        }
      },

      // Limpiar testimonio actual
      clearCurrent: () => {
        set({ currentTestimonial: null });
      },

      // Limpiar error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'testimonial-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        testimonials: state.testimonials.filter(t => t.estado === 'A' || t.estado === 'P'),
        ownTestimonials: state.ownTestimonials
      })
    }
  )
);
