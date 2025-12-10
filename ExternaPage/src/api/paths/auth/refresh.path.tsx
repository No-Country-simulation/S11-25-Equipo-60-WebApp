import { api } from "@/api/root/api.root";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors";

interface RefreshResponse {
  access: string;
}

type RefreshResult = RefreshResponse | ApiError;

/**
 * Endpoint de refresh token - Renueva el access token usando el refresh token
 * @param refreshToken - Token de refresco
 * @returns RefreshResponse con nuevo access token si es exitoso, ApiError si falla
 */
export const refreshToken = async (refreshToken: string): Promise<RefreshResult> => {
  try {
    const response = await api.post('/app/token/refresh/', { refresh: refreshToken });
    return handleSuccessResponse<RefreshResponse>(response, 200);
  } catch (error: any) {
    return handleApiError(error, 'Token de refresco inválido o expirado');
  }
}
