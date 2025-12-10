/**
 * API Error Handler
 * Responsabilidad: Manejar errores HTTP de Axios
 * Se usa en: Endpoints de API (paths/)
 */

import axios from 'axios'
import type { ApiError } from '../types/api-error.type'

/**
 * Maneja errores de Axios y los convierte a formato ApiError estandarizado
 * @param error - Error de Axios
 * @param defaultMessage - Mensaje por defecto si no se puede extraer uno del error
 * @returns ApiError estandarizado
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = 'Error en la petición'
): ApiError {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Error de respuesta del servidor (4xx, 5xx)
      return {
        success: false,
        statusCode: error.response.status,
        message: error.response.data?.message || defaultMessage,
        details: error.response.data,
      }
    } else if (error.request) {
      // Error de red (sin respuesta)
      return {
        success: false,
        statusCode: 0,
        message: 'Error de conexión. Verifica tu conexión a internet.',
        details: error.message,
      }
    }
  }

  // Error de configuración u otro tipo
  return {
    success: false,
    statusCode: 500,
    message: defaultMessage,
    details: error instanceof Error ? error.message : 'Unknown error',
  }
}
