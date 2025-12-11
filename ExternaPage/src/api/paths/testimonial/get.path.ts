import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Testimonio } from "@/interfaces";

type GetTestimonialsResult = Testimonio[] | ApiError;

/**
 * Endpoint para obtener todos los testimonios públicos (aprobados/publicados)
 * @returns Array de testimonios si es exitoso, ApiError si falla
 */
export const getTestimonials = async (): Promise<GetTestimonialsResult> => {
  try {
    const response = await api.get('/app/testimonios/');
    return handleSuccessResponse<Testimonio[]>(response, 200);
  } catch (error: any) {
    return handleApiError(error, 'Error al obtener testimonios');
  }
}
