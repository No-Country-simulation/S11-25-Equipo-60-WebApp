import { api } from "@/api";
import { type ApiError, handleApiError, handleSuccessResponse } from "@/core";
import type { Testimonio } from "@/interfaces";

/**
 * Agrega feedback a un testimonio en estado ESPERA y lo cambia automáticamente a RECHAZADO
 * Solo editores de la organización o administradores pueden usar esta función
 * @param id - ID del testimonio
 * @param feedback - Feedback explicando por qué se rechaza (obligatorio, min 1 carácter)
 * @returns Promise con Testimonio actualizado (ahora en estado RECHAZADO) o ApiError
 */
export const addFeedbackToTestimonial = async (
  id: number,
  feedback: string
): Promise<Testimonio | ApiError> => {
  try {
    if (!feedback?.trim()) {
      throw new Error('El feedback no puede estar vacío');
    }

    const response = await api.patch<Testimonio>(
      `/app/testimonios-feedback/${id}/`,
      { feedback: feedback.trim() }
    );
    
    return handleSuccessResponse<Testimonio>(response);
  } catch (error: any) {
    return handleApiError(error, `[addFeedbackToTestimonial ${id}]`);
  }
};
