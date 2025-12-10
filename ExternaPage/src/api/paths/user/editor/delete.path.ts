import { api } from "@/api"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type DeleteEditorResult = void | ApiError

/**
 * DELETE /editores/{id}/
 * Eliminar editor
 * Requiere permisos: Admin
 */
export const deleteEditor = async (id: number): Promise<DeleteEditorResult> => {
  try {
    const response = await api.delete(`/app/editores/${id}/`)
    return handleSuccessResponse<void>(response, 204)
  } catch (error: any) {
    return handleApiError(error, 'Error al eliminar editor')
  }
}
