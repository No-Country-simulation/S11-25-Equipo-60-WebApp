import { api } from "@/api";
import { type ApiError, handleApiError, handleSuccessResponse } from "@/core";
import type { Testimonio } from "@/interfaces";

/**
 * Obtiene testimonios propios según rol del usuario autenticado
 * - Editores: testimonios de SUS organizaciones (excepto borradores)
 * - Visitantes: SUS propios testimonios (todos los estados)
 * - Admin: todos los testimonios (excepto borradores)
 * @returns Promise con array de Testimonio o ApiError
 */
export const getOwnTestimonials = async (): Promise<Testimonio[] | ApiError> => {
  try {
    const response = await api.get<Testimonio[]>("/app/testimonios-totales/");
    return handleSuccessResponse<Testimonio[]>(response);
  } catch (error: any) {
    return handleApiError(error, "[getOwnTestimonials]");
  }
};
