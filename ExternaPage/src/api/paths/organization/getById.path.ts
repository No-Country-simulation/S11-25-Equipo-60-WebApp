import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Organizacion } from "@/interfaces";

type GetOrganizationByIdResult = Organizacion | ApiError;

/**
 * Endpoint para obtener una organización por ID
 * @param id - ID de la organización
 * @returns Organización si es exitoso, ApiError si falla
 */
export const getOrganizationById = async (id: number): Promise<GetOrganizationByIdResult> => {
  try {
    const response = await api.get(`/app/organizacion/${id}/`);
    return handleSuccessResponse<Organizacion>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al obtener organización ${id}`);
  }
}
