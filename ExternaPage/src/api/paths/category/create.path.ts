import { api } from "@/api/interceptors";
import { handleApiError, handleSuccessResponse } from "@/core";
import type { Categoria, ApiError } from "@/interfaces";

/**
 * Crea una nueva categoría (solo admin)
 * @param data - Datos de la categoría (nombre_categoria, icono, color requeridos)
 * @returns Promise con Categoria creada o ApiError
 */
export const createCategory = async (data: Omit<Categoria, 'id' | 'fecha_registro'>): Promise<Categoria | ApiError> => {
  try {
    const response = await api.post<Categoria>("/app/categorias/", data);
    return handleSuccessResponse<Categoria>(response, 201);
  } catch (error: any) {
    return handleApiError(error, "[createCategory]");
  }
};
