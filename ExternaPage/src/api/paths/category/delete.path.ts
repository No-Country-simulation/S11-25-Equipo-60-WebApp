import { api } from "@/api";
import { ApiError, handleApiError, handleSuccessResponse } from "@/core";

/**
 * Elimina una categoría (solo admin)
 * @param id - ID de la categoría a eliminar
 * @returns Promise con void o ApiError
 */
export const deleteCategory = async (id: number): Promise<void | ApiError> => {
  try {
    const response = await api.delete(`/app/categorias/${id}/`);
    return handleSuccessResponse<void>(response, 204);
  } catch (error: any) {
    return handleApiError(error, `[deleteCategory ${id}]`);
  }
};
