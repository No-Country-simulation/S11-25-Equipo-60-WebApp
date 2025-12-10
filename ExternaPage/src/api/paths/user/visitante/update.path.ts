import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type UpdateVisitanteResult = Usuario | ApiError

/**
 * PATCH /visitantes/{id}/
 * Actualizar datos de visitante
 * Requiere permisos: Editor, Admin, o el propio visitante
 */
export const updateVisitante = async (
  id: number, 
  data: Partial<Usuario>
): Promise<UpdateVisitanteResult> => {
  try {
    const response = await api.patch(`/app/visitantes/${id}/`, data)
    return handleSuccessResponse<Usuario>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al actualizar visitante')
  }
}
