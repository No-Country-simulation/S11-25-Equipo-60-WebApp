import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";

interface AddVisitorsData {
  visitantes: number[]; // Array de IDs de visitantes
}

interface AddVisitorsResponse {
  success: true;
  message: string;
  visitantes: number[];
}

type AddVisitorsResult = AddVisitorsResponse | ApiError;

/**
 * Endpoint para agregar visitantes a una organización
 * @param orgId - ID de la organización
 * @param visitorIds - Array de IDs de visitantes a agregar
 * @returns AddVisitorsResponse si es exitoso, ApiError si falla
 */
export const addVisitors = async (orgId: number, visitorIds: number[]): Promise<AddVisitorsResult> => {
  try {
    const response = await api.post(`/app/organizacion/${orgId}/agregar-visitantes/`, { visitantes: visitorIds });
    return handleSuccessResponse<AddVisitorsResponse>(response, 200);
  } catch (error: any) {
    return handleApiError(error, `Error al agregar visitantes a organización ${orgId}`);
  }
}
