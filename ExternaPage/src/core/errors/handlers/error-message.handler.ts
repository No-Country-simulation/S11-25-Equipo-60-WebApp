/**
 * Error Message Extractor
 * Responsabilidad: Extraer y formatear mensajes de error
 * Se usa en: Store helpers (async-action.helper.ts)
 */

/**
 * Extrae mensaje de error de manera consistente
 * @param error - Error capturado
 * @param defaultMessage - Mensaje por defecto
 * @param context - Contexto opcional para prefijo
 * @returns Mensaje de error formateado
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string,
  context?: string
): string {
  const message = error instanceof Error ? error.message : defaultMessage
  return context ? `[${context}] ${message}` : message
}
