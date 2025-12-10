import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { TestimonioAprobado } from "@/interfaces";

type GetApprovedTestimonialsResult = TestimonioAprobado[] | ApiError;

/**
 * Endpoint para obtener testimonios aprobados de una organización
 * @param orgId - ID de la organización
 * @returns Array de testimonios aprobados si es exitoso, ApiError si falla
 */
export const getApprovedTestimonials = async (orgId: number): Promise<GetApprovedTestimonialsResult> => {
  try {
    const response = await api.get(`/app/organizacion/${orgId}/testimonios-aprobados/`);
    return handleSuccessResponse<TestimonioAprobado[]>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al obtener testimonios aprobados de organización ${orgId}`);
  }
}
