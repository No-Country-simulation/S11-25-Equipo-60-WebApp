import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Testimonio } from "@/interfaces";

type UpdateTestimonialResult = Testimonio | ApiError;

/**
 * Endpoint para actualizar un testimonio
 * @param id - ID del testimonio
 * @param data - Datos a actualizar
 * @returns Testimonio actualizado si es exitoso, ApiError si falla
 */
export const updateTestimonial = async (id: number, data: Partial<Testimonio>): Promise<UpdateTestimonialResult> => {
  try {
    const response = await api.patch(`/app/testimonios/${id}/`, data);
    return handleSuccessResponse<Testimonio>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al actualizar testimonio ${id}`);
  }
}
