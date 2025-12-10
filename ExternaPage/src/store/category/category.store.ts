import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDBStorage } from "@/store/adapters";
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "@/api";
import { validateApiResponse } from "@/core";
import type { Categoria } from "@/interfaces";

interface CategoryStateData {
  categories: Categoria[];
  currentCategory: Categoria | null;
  isLoading: boolean;
  error: string | null;
}

interface CategoryActions {
  fetchCategories: () => Promise<void>;
  fetchCategory: (id: number) => Promise<void>;
  createCategory: (data: Omit<Categoria, 'id' | 'fecha_registro'>) => Promise<void>;
  updateCategory: (id: number, data: Partial<Categoria>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  clearCurrent: () => void;
  clearError: () => void;
}

type CategoryState = CategoryStateData & CategoryActions;

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      categories: [],
      currentCategory: null,
      isLoading: false,
      error: null,

      // Obtener todas las categorías
      fetchCategories: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await getCategories();
          const categories = validateApiResponse<Categoria[]>(result, '[fetchCategories]');

          set({
            categories,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al obtener categorías'
          });
        }
      },

      // Obtener categoría por ID
      fetchCategory: async (id: number) => {
        set({ isLoading: true, error: null });

        try {
          const result = await getCategoryById(id);
          const category = validateApiResponse<Categoria>(result, `[fetchCategory ${id}]`);

          set({
            currentCategory: category,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al obtener categoría ${id}`
          });
        }
      },

      // Crear categoría
      createCategory: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const result = await createCategory(data);
          const newCategory = validateApiResponse<Categoria>(result, '[createCategory]');

          set({
            categories: [...get().categories, newCategory],
            currentCategory: newCategory,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al crear categoría'
          });
        }
      },

      // Actualizar categoría
      updateCategory: async (id, data) => {
        set({ isLoading: true, error: null });

        try {
          const result = await updateCategory(id, data);
          const updatedCategory = validateApiResponse<Categoria>(result, `[updateCategory ${id}]`);

          set({
            categories: get().categories.map(category => 
              category.id === id ? updatedCategory : category
            ),
            currentCategory: get().currentCategory?.id === id ? updatedCategory : get().currentCategory,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al actualizar categoría ${id}`
          });
        }
      },

      // Eliminar categoría
      deleteCategory: async (id) => {
        set({ isLoading: true, error: null });

        try {
          const result = await deleteCategory(id);
          validateApiResponse(result, `[deleteCategory ${id}]`);

          set({
            categories: get().categories.filter(category => category.id !== id),
            currentCategory: get().currentCategory?.id === id ? null : get().currentCategory,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || `Error al eliminar categoría ${id}`
          });
        }
      },

      // Limpiar categoría actual
      clearCurrent: () => {
        set({ currentCategory: null });
      },

      // Limpiar error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'category-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        categories: state.categories
      })
    }
  )
);
