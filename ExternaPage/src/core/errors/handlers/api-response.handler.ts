/**
 * API Response Handler
 * Responsabilidad: Validar respuestas HTTP exitosas
 * Se usa en: Endpoints de API (paths/)
 */

import type { AxiosResponse } from 'axios'
import type { ApiError } from '../types/api-error.type'

/**
 * Valida que la respuesta tenga el código de estado esperado
 * Si no coincide, retorna ApiError. Si coincide, retorna los datos.
 * @param response - Respuesta de Axios
 * @param expectedStatus - Código de estado esperado (default: 200)
 * @returns Los datos si es exitoso, ApiError si falla
 */
export function handleSuccessResponse<T>(
  response: AxiosResponse<T>,
  expectedStatus: number = 200
): T | ApiError {
  if (response.status !== expectedStatus) {
    return {
      success: false,
      statusCode: response.status,
      message: `Código de estado inesperado: ${response.status}`,
      details: response.data,
    }
  }

  return response.data
}
