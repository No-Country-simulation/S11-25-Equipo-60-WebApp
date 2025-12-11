import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";

interface DeleteTestimonialResponse {
  success: true;
  message?: string;
}

type DeleteTestimonialResult = DeleteTestimonialResponse | ApiError;

/**
 * Endpoint para eliminar un testimonio
 * @param id - ID del testimonio
 * @returns DeleteTestimonialResponse si es exitoso, ApiError si falla
 */
export const deleteTestimonial = async (id: number): Promise<DeleteTestimonialResult> => {
  try {
    const response = await api.delete(`/app/testimonios/${id}/`);
    return handleSuccessResponse<DeleteTestimonialResponse>(response, 204);
  } catch (error: any) {
    return handleApiError(error, `Error al eliminar testimonio ${id}`);
  }
}
