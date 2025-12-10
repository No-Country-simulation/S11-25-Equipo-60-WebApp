import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Organizacion } from "@/interfaces";

interface UpdateOrganizationData {
  organizacion_nombre?: string;
  dominio?: string;
}

type UpdateOrganizationResult = Organizacion | ApiError;

/**
 * Endpoint para actualizar una organización
 * @param id - ID de la organización
 * @param data - Datos a actualizar
 * @returns Organización actualizada si es exitoso, ApiError si falla
 */
export const updateOrganization = async (id: number, data: UpdateOrganizationData): Promise<UpdateOrganizationResult> => {
  try {
    const response = await api.patch(`/app/organizacion/${id}/`, data);
    return handleSuccessResponse<Organizacion>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al actualizar organización ${id}`);
  }
}
