/**
 * API Response Validator
 * Responsabilidad: Validar que respuestas de API no sean errores
 * Se usa en: Store helpers (async-action.helper.ts)
 */

import { isApiError, type ApiError } from '../types/api-error.type'

/**
 * Valida que el resultado de una operación no sea un ApiError
 * Si es error, lanza excepción con contexto. Si es exitoso, retorna el resultado.
 * @param result - Resultado de la operación (puede ser datos o ApiError)
 * @param context - Contexto de la operación para mensajes más claros (ej: "fetchProfile")
 * @throws Error con mensaje formateado si es ApiError
 * @returns El resultado si es válido
 */
export function validateApiResponse<T>(result: T | ApiError, context: string): T {
  if (isApiError(result)) {
    throw new Error(`[${context}] ${result.message}`)
  }
  return result
}
