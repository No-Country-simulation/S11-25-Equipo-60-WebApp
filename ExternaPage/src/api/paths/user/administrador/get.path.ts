import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type AdministradoresResult = Usuario[] | ApiError

/**
 * GET /administradores/
 * Obtener lista de todos los administradores
 * Requiere permisos: Admin
 */
export const getAdministradores = async (): Promise<AdministradoresResult> => {
  try {
    const response = await api.get('/app/administradores/')
    return handleSuccessResponse<Usuario[]>(response, 200)
  } catch (error: any) {
    return handleApiError(error, 'Error al obtener administradores')
  }
}
