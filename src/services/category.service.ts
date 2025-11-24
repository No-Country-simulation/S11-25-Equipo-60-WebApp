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
};
