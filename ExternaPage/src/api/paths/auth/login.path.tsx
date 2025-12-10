import { api } from "@/api";
import type { UserCredentials, LoginResponse } from "@/interfaces";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core";

type LoginResult = LoginResponse | ApiError;

/**
 * Endpoint de login - Solo hace la llamada HTTP
 * @param credentials - Email y contraseña del usuario
 * @returns LoginResponse si es exitoso, ApiError si falla
 */
export const login = async (credentials: UserCredentials): Promise<LoginResult> => {
  try {
    const response = await api.post('/app/login/', credentials);
    return handleSuccessResponse<LoginResponse>(response, 200);
  } catch (error: any) {
    return handleApiError(error, 'Error al iniciar sesión');
  }
}
