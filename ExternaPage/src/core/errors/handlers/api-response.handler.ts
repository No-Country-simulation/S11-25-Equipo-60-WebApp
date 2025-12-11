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
  // Verificar que la respuesta es un objeto válido
  if (!response || typeof response !== 'object') {
    return {
      success: false,
      statusCode: 500,
      message: 'Respuesta inválida del servidor',
      details: 'La respuesta no es un objeto válido',
    }
  }

  // Verificar que no sea HTML
  if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
    return {
      success: false,
      statusCode: response.status || 500,
      message: 'Error: El servidor devolvió HTML en lugar de JSON',
      details: 'Verifica la URL de la API y que el endpoint exista',
    }
  }

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
