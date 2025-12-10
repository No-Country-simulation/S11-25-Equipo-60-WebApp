import { api } from "@/api"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type DeleteAdministradorResult = void | ApiError

/**
 * DELETE /administradores/{id}/
 * Eliminar administrador
 * Requiere permisos: Admin
 */
export const deleteAdministrador = async (id: number): Promise<DeleteAdministradorResult> => {
  try {
    const response = await api.delete(`/app/administradores/${id}/`)
    return handleSuccessResponse<void>(response, 204)
  } catch (error: any) {
    return handleApiError(error, 'Error al eliminar administrador')
  }
}
