import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type UpdateAdministradorResult = Usuario | ApiError

/**
 * PATCH /administradores/{id}/
 * Actualizar datos de administrador
 * Requiere permisos: Admin
 */
export const updateAdministrador = async (
  id: number, 
  data: Partial<Usuario>
): Promise<UpdateAdministradorResult> => {
  try {
    const response = await api.patch(`/app/administradores/${id}/`, data)
    return handleSuccessResponse<Usuario>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al actualizar administrador')
  }
}
