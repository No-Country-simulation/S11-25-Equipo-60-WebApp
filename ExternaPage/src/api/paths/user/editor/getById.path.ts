import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type EditorResult = Usuario | ApiError

/**
 * GET /editores/{id}/
 * Obtener editor específico por ID
 * Requiere permisos: Admin o el propio editor
 */
export const getEditor = async (id: number): Promise<EditorResult> => {
  try {
    const response = await api.get(`/app/editores/${id}/`)
    return handleSuccessResponse<Usuario>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al obtener editor')
  }
}
