import { api } from "@/api"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type DeleteVisitanteResult = void | ApiError

/**
 * DELETE /visitantes/{id}/
 * Eliminar visitante
 * Requiere permisos: Admin o el propio visitante
 */
export const deleteVisitante = async (id: number): Promise<DeleteVisitanteResult> => {
  try {
    const response = await api.delete(`/app/visitantes/${id}/`)
    return handleSuccessResponse<void>(response, 204)
  } catch (error: any) {
    return handleApiError(error, 'Error al eliminar visitante')
  }
}
