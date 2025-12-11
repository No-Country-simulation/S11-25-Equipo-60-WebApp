import { api } from "@/api";
import { ApiError, handleApiError, handleSuccessResponse } from "@/core";
import type { Categoria } from "@/interfaces";

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
