import { api } from "@/api"
import type { Usuario } from "@/interfaces"
import { handleApiError, handleSuccessResponse, type ApiError } from "@/core/errors"

type CreateVisitanteResult = Usuario | ApiError

/**
 * POST /visitantes/
 * Crear nuevo visitante
 * Público o requiere permisos según configuración del backend
 */
export const createVisitante = async (data: Usuario): Promise<CreateVisitanteResult> => {
  try {
    const response = await api.post('/app/visitantes/', data)
    return handleSuccessResponse<Usuario>(response, 201)
  } catch (error: any) {
    return handleApiError(error, 'Error al crear visitante')
  }
}
