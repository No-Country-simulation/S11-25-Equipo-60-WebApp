/**
 * API Error Type
 * Interfaz compartida para todos los errores de API
 * Single Source of Truth para manejo de errores
 */
export interface ApiError {
  success: false
  statusCode: number
  message: string
  details?: any
}

/**
 * Type Guard: Verifica si una respuesta es un error
 */
export function isApiError(response: any): response is ApiError {
  return response && 'success' in response && response.success === false
}
