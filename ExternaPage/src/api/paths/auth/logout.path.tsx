import { api } from "@/api";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";

interface LogoutResponse {
  success: true;
  message?: string;
}

type LogoutResult = LogoutResponse | ApiError;

/**
 * Endpoint de logout - Solo hace la llamada HTTP (opcional)
 * El logout principalmente se maneja en el frontend limpiando el estado
 * @returns LogoutResponse si es exitoso, ApiError si falla
 */
export const logout = async (): Promise<LogoutResult> => {
  try {
    const response = await api.post('/app/logout/');
    return handleSuccessResponse<LogoutResponse>(response, 200);
  } catch (error: any) {
    return handleApiError(error, 'Error al cerrar sesión');
  }
}
