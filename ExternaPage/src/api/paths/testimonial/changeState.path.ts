import { api } from "@/api";
import { type ApiError, handleApiError, handleSuccessResponse } from "@/core";
import type { Testimonio } from "@/interfaces";

/**
 * Cambia el estado de un testimonio (solo editores/admin)
 * @param id - ID del testimonio
 * @param estado - Nuevo estado ('A': Aprobado, 'R': Rechazado, 'E': Espera, etc.)
 * @param feedback - Feedback requerido solo para estado 'R' (Rechazado)
 * @returns Promise con Testimonio actualizado o ApiError
 */
export const changeTestimonialState = async (
  id: number,
  estado: string,
  feedback?: string
): Promise<Testimonio | ApiError> => {
  try {
    const data: any = { estado };

    // Si el estado es RECHAZADO, el feedback es obligatorio
    if (estado === 'R' && feedback) {
      data.feedback = feedback;
    }

    const response = await api.patch<Testimonio>(
      `/app/testimonios-cambiar-estado/${id}/`,
      data
    );
    return handleSuccessResponse<Testimonio>(response);
  } catch (error: any) {
    return handleApiError(error, `[changeTestimonialState ${id}]`);
  }
};
