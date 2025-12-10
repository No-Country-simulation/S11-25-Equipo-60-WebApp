import { api } from "@/api/root/api.root";
import type { Usuario, RegisterResponse } from "@/interfaces";
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors";

type RegisterResult = RegisterResponse | ApiError;

/**
 * Endpoint de registro - Solo hace la llamada HTTP
 * @param data - Datos del usuario a registrar (username, email, password)
 * @returns RegisterResponse si es exitoso, ApiError si falla
 */
export const register = async (data: Usuario): Promise<RegisterResult> => {
  try {
    const response = await api.post('/app/visitantes/', data);
    return handleSuccessResponse<RegisterResponse>(response, 201);
  } catch (error: any) {
    return handleApiError(error, 'Error al registrar usuario');
  }
}
