import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type VisitanteResult = Usuario | ApiError

/**
 * GET /visitantes/{id}/
 * Obtener visitante específico por ID
 * Requiere permisos: Editor, Admin, o el propio visitante
 */
export const getVisitante = async (id: number): Promise<VisitanteResult> => {
  try {
    const response = await api.get(`/app/visitantes/${id}/`)
    return handleSuccessResponse<Usuario>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al obtener visitante')
  }
}
