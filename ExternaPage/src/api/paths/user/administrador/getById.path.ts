import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type AdministradorResult = Usuario | ApiError

/**
 * GET /administradores/{id}/
 * Obtener administrador específico por ID
 * Requiere permisos: Admin
 */
export const getAdministrador = async (id: number): Promise<AdministradorResult> => {
  try {
    const response = await api.get(`/app/administradores/${id}/`)
    return handleSuccessResponse<Usuario>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al obtener administrador')
  }
}
