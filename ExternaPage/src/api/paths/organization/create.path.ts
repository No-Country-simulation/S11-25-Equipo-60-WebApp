import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";
import type { Organizacion } from "@/interfaces";

interface CreateOrganizationData {
  organizacion_nombre: string;
  dominio: string;
}

type CreateOrganizationResult = Organizacion | ApiError;

/**
 * Endpoint para crear una organización
 * @param data - Datos de la organización (nombre y dominio)
 * @returns Organización creada si es exitoso, ApiError si falla
 */
export const createOrganization = async (data: CreateOrganizationData): Promise<CreateOrganizationResult> => {
  try {
    const response = await api.post('/app/organizacion/', data);
    return handleSuccessResponse<Organizacion>(response, 201);
  } catch (error: any) {
    return handleApiError(error, 'Error al crear organización');
  }
}
