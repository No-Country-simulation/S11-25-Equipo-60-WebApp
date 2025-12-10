import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Testimonio } from "@/interfaces";

type RejectTestimonialResult = Testimonio | ApiError;

/**
 * Endpoint para rechazar un testimonio (solo editores/admin)
 * @param id - ID del testimonio
 * @returns Testimonio rechazado si es exitoso, ApiError si falla
 */
export const rejectTestimonial = async (id: number): Promise<RejectTestimonialResult> => {
  try {
    const response = await api.post(`/app/testimonio/${id}/rechazar/`);
    return handleSuccessResponse<Testimonio>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al rechazar testimonio ${id}`);
  }
}
