/**
 * Core Errors Module
 * Exporta handlers y types para manejo centralizado de errores
 */

// Types
export type { ApiError } from './types/api-error.type'
export { isApiError } from './types/api-error.type'

// Handlers para endpoints de API
export { handleApiError } from './handlers/api-error.handler'
export { handleSuccessResponse } from './handlers/api-response.handler'

// Handlers para validación en stores
export { validateApiResponse } from './handlers/api-validator.handler'
export { extractErrorMessage } from './handlers/error-message.handler'
