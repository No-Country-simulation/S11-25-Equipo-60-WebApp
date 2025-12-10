import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Testimonio } from "@/interfaces";

type CreateTestimonialResult = Testimonio | ApiError;

/**
 * Endpoint para crear un testimonio
 * @param data - Datos del testimonio (puede ser anónimo o registrado)
 * @returns Testimonio creado si es exitoso, ApiError si falla
 */
export const createTestimonial = async (data: Partial<Testimonio>): Promise<CreateTestimonialResult> => {
  try {
    const response = await api.post('/app/testimonio/', data);
    return handleSuccessResponse<Testimonio>(response, 201);
  } catch (error: any) {
    return handleApiError(error, 'Error al crear testimonio');
  }
}
