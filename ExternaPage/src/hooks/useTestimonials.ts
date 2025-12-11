"use client";

import { useEffect } from "react";
import { useTestimonialStore } from "@/stores/testimonial/testimonial.store";

/**
 * Hook personalizado para obtener y gestionar testimonios del backend
 * Automáticamente obtiene testimonios públicos al montar el componente
 * 
 * @returns {Object} Estado y funciones del store de testimonios
 * - testimonials: Array de testimonios públicos (aprobados/publicados)
 * - isLoading: Estado de carga
 * - error: Mensaje de error si existe
 * - fetchTestimonials: Función para recargar testimonios
 */
export const useTestimonials = () => {
  const { 
    testimonials, 
    isLoading, 
    error, 
    fetchTestimonials,
    clearError 
  } = useTestimonialStore();

  useEffect(() => {
    // Obtener testimonios solo si no hay testimonios en el estado
    if (testimonials.length === 0) {
      fetchTestimonials();
    }
  }, [fetchTestimonials, testimonials.length]);

  return {
    testimonials,
    isLoading,
    error,
    refetch: fetchTestimonials,
    clearError
  };
};
