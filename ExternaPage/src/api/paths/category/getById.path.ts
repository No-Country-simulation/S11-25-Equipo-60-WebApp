import { api } from "@/api";
import { ApiError, handleApiError, handleSuccessResponse } from "@/core";
import type { Categoria } from "@/interfaces";

/**
 * Obtiene una categoría por ID
 * @param id - ID de la categoría
 * @returns Promise con Categoria o ApiError
 */
export const getCategoryById = async (id: number): Promise<Categoria | ApiError> => {
  try {
    const response = await api.get<Categoria>(`/app/categorias/${id}/`);
    return handleSuccessResponse<Categoria>(response);
  } catch (error: any) {
    return handleApiError(error, `[getCategoryById ${id}]`);
  }
};
