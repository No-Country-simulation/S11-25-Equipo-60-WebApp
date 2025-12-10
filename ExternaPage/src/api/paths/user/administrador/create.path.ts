import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type CreateAdministradorResult = Usuario | ApiError

/**
 * POST /administradores/
 * Crear nuevo administrador
 * Requiere permisos: Admin
 */
export const createAdministrador = async (data: Usuario): Promise<CreateAdministradorResult> => {
  try {
    const response = await api.post('/app/administradores/', data)
    return handleSuccessResponse<Usuario>(response, 201)
  } catch (error: any) {
    return handleApiError(error, 'Error al crear administrador')
  }
}
