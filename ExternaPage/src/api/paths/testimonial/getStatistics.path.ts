import { api } from "@/api";
import { type  ApiError, handleApiError, handleSuccessResponse } from "@/core";

interface TestimonialStatistics {
  organizacion_id: number;
  organizacion_nombre: string;
  estadisticas: {
    total_testimonios: number;
    aprobados: number;
    en_espera: number;
    rechazados: number;
  };
}

/**
 * Obtiene estadísticas de testimonios por organización (solo editores/admin)
 * @returns Promise con array de estadísticas o ApiError
 */
export const getTestimonialStatistics = async (): Promise<TestimonialStatistics[] | ApiError> => {
  try {
    const response = await api.get<TestimonialStatistics[]>(
      "/app/testimonios-totales/estadisticas/"
    );
    return handleSuccessResponse<TestimonialStatistics[]>(response);
  } catch (error: any) {
    return handleApiError(error, "[getTestimonialStatistics]");
  }
};
