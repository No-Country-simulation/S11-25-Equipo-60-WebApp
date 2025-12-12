"use client";

import { useEffect } from "react";
import { useCategoryStore } from "@/stores";

/**
 * Hook personalizado para obtener categorías usando el store de Zustand
 *
 * @returns {Object} Estado y funciones para gestionar categorías
 * - categories: Array de categorías disponibles
 * - isLoading: Estado de carga
 * - error: Mensaje de error si existe
 * - refetch: Función para recargar categorías
 */
export const useCategories = () => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    clearError
  } = useCategoryStore();

  useEffect(() => {
    // Solo cargar si no hay categorías en el store
    if (categories.length === 0) {
      fetchCategories();
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    clearError
  };
};
