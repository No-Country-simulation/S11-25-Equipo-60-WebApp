import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type EditoresResult = Usuario[] | ApiError

/**
 * GET /editores/
 * Obtener lista de todos los editores
 * Requiere permisos: Admin
 */
export const getEditores = async (): Promise<EditoresResult> => {
  try {
    const response = await api.get('/app/editores/')
    return handleSuccessResponse<Usuario[]>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al obtener editores')
  }
}
