import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Testimonio } from "@/interfaces";

type GetTestimonialByIdResult = Testimonio | ApiError;

/**
 * Endpoint para obtener un testimonio por ID
 * @param id - ID del testimonio
 * @returns Testimonio si es exitoso, ApiError si falla
 */
export const getTestimonialById = async (id: number): Promise<GetTestimonialByIdResult> => {
  try {
    const response = await api.get(`/app/testimonios/${id}/`);
    return handleSuccessResponse<Testimonio>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al obtener testimonio ${id}`);
  }
}
