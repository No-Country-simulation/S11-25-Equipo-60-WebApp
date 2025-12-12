"use client";

import { useEffect, useState } from "react";
import { getApprovedTestimonials } from "@/api";
import { validateApiResponse } from "@/core";

import type { TestimonioAprobado } from "@/interfaces";
import { GET_ORGANIZATION_ID } from "@/config";


/**
 * Hook personalizado para obtener testimonios aprobados de tu organización
 * El backend ya filtra por estado='A' (aprobados), no necesitamos filtrar nuevamente
 *
 * @returns {Object} Estado y funciones para gestionar testimonios
 * - testimonials: Array de testimonios aprobados de tu organización
 * - isLoading: Estado de carga
 * - error: Mensaje de error si existe
 * - refetch: Función para recargar testimonios
 */
export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<TestimonioAprobado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getApprovedTestimonials(+GET_ORGANIZATION_ID);
      const data = validateApiResponse<any>(result, '[useTestimonials]');

      console.log('📊 Datos recibidos del backend:', data);

      // El backend devuelve un objeto con estructura:
      // { organizacion: {...}, testimonios_aprobados: [...], total_testimonios: N, promedio_ranking: X }
      // Ya vienen filtrados por estado='A', no necesitamos filtrar nuevamente
      let testimoniosArray: TestimonioAprobado[] = [];

      if (data && typeof data === 'object' && 'testimonios_aprobados' in data) {
        // Extraer el array de testimonios_aprobados (ya filtrados por el backend)
        testimoniosArray = data.testimonios_aprobados || [];
        console.log('✅ Testimonios recibidos:', testimoniosArray.length, 'testimonios aprobados');
      } else if (Array.isArray(data)) {
        // Por si acaso el backend cambia y devuelve directamente el array
        testimoniosArray = data;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado');
      }

      // Usar directamente los testimonios del backend (ya filtrados por estado='A')
      setTestimonials(testimoniosArray);
    } catch (err: any) {
      console.error('❌ Error en useTestimonials:', err);
      setError(err.message || 'Error al obtener testimonios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return {
    testimonials,
    isLoading,
    error,
    refetch: fetchTestimonials,
    clearError: () => setError(null)
  };
};
