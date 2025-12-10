import { api } from "@/api/interceptors";
import { handleApiError, handleSuccessResponse } from "@/core";
import type { Categoria, ApiError } from "@/interfaces";

/**
 * Actualiza una categoría existente (solo admin)
 * @param id - ID de la categoría
 * @param data - Datos parciales a actualizar
 * @returns Promise con Categoria actualizada o ApiError
 */
export const updateCategory = async (id: number, data: Partial<Categoria>): Promise<Categoria | ApiError> => {
  try {
    const response = await api.patch<Categoria>(`/app/categorias/${id}/`, data);
    return handleSuccessResponse<Categoria>(response);
  } catch (error: any) {
    return handleApiError(error, `[updateCategory ${id}]`);
  }
};
