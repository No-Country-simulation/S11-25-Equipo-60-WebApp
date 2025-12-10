import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Testimonio } from "@/interfaces";

type ApproveTestimonialResult = Testimonio | ApiError;

/**
 * Endpoint para aprobar un testimonio (solo editores/admin)
 * @param id - ID del testimonio
 * @returns Testimonio aprobado si es exitoso, ApiError si falla
 */
export const approveTestimonial = async (id: number): Promise<ApproveTestimonialResult> => {
  try {
    const response = await api.post(`/app/testimonio/${id}/aprobar/`);
    return handleSuccessResponse<Testimonio>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al aprobar testimonio ${id}`);
  }
}
