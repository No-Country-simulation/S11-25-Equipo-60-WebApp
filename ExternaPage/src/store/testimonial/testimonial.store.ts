import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDBStorage } from "@/store/adapters";
import { 
  getTestimonials, 
  getTestimonialById, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  approveTestimonial,
  rejectTestimonial
} from "@/api";
import { validateApiResponse } from "@/core";
import type { Testimonio } from "@/interfaces";

interface TestimonialStateData {
  testimonials: Testimonio[];
  currentTestimonial: Testimonio | null;
  isLoading: boolean;
  error: string | null;
}

interface TestimonialActions {
  fetchTestimonials: () => Promise<void>;
  fetchTestimonial: (id: number) => Promise<void>;
  createTestimonial: (data: Partial<Testimonio>) => Promise<void>;
  updateTestimonial: (id: number, data: Partial<Testimonio>) => Promise<void>;
  deleteTestimonial: (id: number) => Promise<void>;
  approveTestimonial: (id: number) => Promise<void>;
  rejectTestimonial: (id: number) => Promise<void>;
  clearCurrent: () => void;
  clearError: () => void;
}

type TestimonialState = TestimonialStateData & TestimonialActions;

export const useTestimonialStore = create<TestimonialState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      testimonials: [],
      currentTestimonial: null,
      isLoading: false,
      error: null,

      // Obtener todos los testimonios
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

      // Crear testimonio
      createTestimonial: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const result = await createTestimonial(data);
          const newTestimonial = validateApiResponse<Testimonio>(result, '[createTestimonial]');

          set({
            testimonials: [...get().testimonials, newTestimonial],
            currentTestimonial: newTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al crear testimonio'
          });
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
            currentTestimonial: get().currentTestimonial?.id === id ? updatedTestimonial : get().currentTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al actualizar testimonio ${id}`
          });
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

      // Aprobar testimonio (solo editores/admin)
      approveTestimonial: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const result = await approveTestimonial(id);
          const approvedTestimonial = validateApiResponse<Testimonio>(result, `[approveTestimonial ${id}]`);

          set({
            testimonials: get().testimonials.map(testimonial => 
              testimonial.id === id ? approvedTestimonial : testimonial
            ),
            currentTestimonial: get().currentTestimonial?.id === id ? approvedTestimonial : get().currentTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al aprobar testimonio ${id}`
          });
        }
      },

      // Rechazar testimonio (solo editores/admin)
      rejectTestimonial: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const result = await rejectTestimonial(id);
          const rejectedTestimonial = validateApiResponse<Testimonio>(result, `[rejectTestimonial ${id}]`);

          set({
            testimonials: get().testimonials.map(testimonial => 
              testimonial.id === id ? rejectedTestimonial : testimonial
            ),
            currentTestimonial: get().currentTestimonial?.id === id ? rejectedTestimonial : get().currentTestimonial,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al rechazar testimonio ${id}`
          });
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
        testimonials: state.testimonials.filter(t => t.estado === 'A' || t.estado === 'P')
      })
    }
  )
);
