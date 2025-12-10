import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type VisitantesResult = Usuario[] | ApiError

/**
 * GET /visitantes/
 * Obtener lista de todos los visitantes
 * Requiere permisos: Editor o Admin
 */
export const getVisitantes = async (): Promise<VisitantesResult> => {
  try {
    const response = await api.get('/app/visitantes/')
    return handleSuccessResponse<Usuario[]>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al obtener visitantes')
  }
}
