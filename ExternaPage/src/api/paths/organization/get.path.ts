import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Organizacion } from "@/interfaces";

type GetOrganizationsResult = Organizacion[] | ApiError;

/**
 * Endpoint para obtener todas las organizaciones
 * @returns Array de organizaciones si es exitoso, ApiError si falla
 */
export const getOrganizations = async (): Promise<GetOrganizationsResult> => {
  try {
    const response = await api.get('/app/organizacion/');
    return handleSuccessResponse<Organizacion[]>(response, 200);
  } catch (error: any) {
    return handleApiError(error, 'Error al obtener organizaciones');
  }
}
