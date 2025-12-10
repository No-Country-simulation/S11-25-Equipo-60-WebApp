import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";

interface AddEditorsData {
  editores: number[]; // Array de IDs de editores
}

interface AddEditorsResponse {
  success: true;
  message: string;
  editores: number[];
}

type AddEditorsResult = AddEditorsResponse | ApiError;

/**
 * Endpoint para agregar editores a una organización
 * @param orgId - ID de la organización
 * @param editorIds - Array de IDs de editores a agregar
 * @returns AddEditorsResponse si es exitoso, ApiError si falla
 */
export const addEditors = async (orgId: number, editorIds: number[]): Promise<AddEditorsResult> => {
  try {
    const response = await api.post(`/app/organizacion/${orgId}/agregar-editores/`, { editores: editorIds });
    return handleSuccessResponse<AddEditorsResponse>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al agregar editores a organización ${orgId}`);
  }
}
