import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";

interface DeleteOrganizationResponse {
  success: true;
  message?: string;
}

type DeleteOrganizationResult = DeleteOrganizationResponse | ApiError;

/**
 * Endpoint para eliminar una organización
 * @param id - ID de la organización
 * @returns DeleteOrganizationResponse si es exitoso, ApiError si falla
 */
export const deleteOrganization = async (id: number): Promise<DeleteOrganizationResult> => {
  try {
    const response = await api.delete(`/app/organizacion/${id}/`);
    return handleSuccessResponse<DeleteOrganizationResponse>(response, 204);
  } catch (error: any) {
    return handleApiError(error, `Error al eliminar organización ${id}`);
  }
}
