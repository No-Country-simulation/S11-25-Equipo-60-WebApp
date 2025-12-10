import { api } from "@/api/interceptors";
import { handleApiError, handleSuccessResponse } from "@/core";
import type { Categoria, ApiError } from "@/interfaces";

/**
 * Obtiene todas las categorías
 * @returns Promise con array de Categoria o ApiError
 */
export const getCategories = async (): Promise<Categoria[] | ApiError> => {
  try {
    const response = await api.get<Categoria[]>("/app/categorias/");
    return handleSuccessResponse<Categoria[]>(response);
  } catch (error: any) {
    return handleApiError(error, "[getCategories]");
  }
};
