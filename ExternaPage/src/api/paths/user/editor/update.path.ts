import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type UpdateEditorResult = Usuario | ApiError

/**
 * PATCH /editores/{id}/
 * Actualizar datos de editor
 * Requiere permisos: Admin o el propio editor
 */
export const updateEditor = async (
  id: number, 
  data: Partial<Usuario>
): Promise<UpdateEditorResult> => {
  try {
    const response = await api.patch(`/app/editores/${id}/`, data)
    return handleSuccessResponse<Usuario>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al actualizar editor')
  }
}
