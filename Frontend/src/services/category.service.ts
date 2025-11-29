import api from '@/lib/api';

export interface Categoria {
    id: number;
    nombre_categoria: string;
    icono?: string;
    color?: string;
    fecha_registro?: string;
}

export const categoryService = {
    // Obtener todas las categorías
    getCategories: async () => {
        const response = await api.get('/app/categorias/');
        return response.data;
    },

    // Obtener una categoría específica
    getCategory: async (id: number) => {
        const response = await api.get(`/app/categorias/${id}/`);
        return response.data;
    },

    // Crear categoría (solo admin)
    createCategory: async (data: Partial<Categoria>) => {
        const response = await api.post('/app/categorias/', data);
        return response.data;
    },

    // Actualizar categoría (solo admin)
    updateCategory: async (id: number, data: Partial<Categoria>) => {
        const response = await api.patch(`/app/categorias/${id}/`, data);
        return response.data;
    },

    // Eliminar categoría (solo admin)
    deleteCategory: async (id: number) => {
        const response = await api.delete(`/app/categorias/${id}/`);
        return response.data;
    },
};
