import { api } from '@/api';

export const organizationService = {
    // Obtener todas las organizaciones
    getOrganizations: async () => {
        const response = await api.get('/app/organizacion/');
        return response.data;
    },

    // Obtener organizaciones del editor actual
    getEditorOrganizations: async () => {
        const response = await api.get('/app/organizacion/');
        return response.data;
    },

    // Obtener una organización específica
    getOrganization: async (id: number) => {
        const response = await api.get(`/app/organizacion/${id}/`);
        return response.data;
    },

    // Crear organización (solo admin)
    createOrganization: async (data: { organizacion_nombre: string; dominio: string; editores?: number[] }) => {
        const response = await api.post('/app/organizacion/', data);
        return response.data;
    },

    // Actualizar organización (solo admin)
    updateOrganization: async (id: number, data: { organizacion_nombre?: string; dominio?: string }) => {
        const response = await api.patch(`/app/organizacion/${id}/`, data);
        return response.data;
    },

    // Eliminar organización (solo admin)
    deleteOrganization: async (id: number) => {
        const response = await api.delete(`/app/organizacion/${id}/`);
        return response.data;
    },

    // Obtener testimonios aprobados de una organización (público)
    getApprovedTestimonials: async (id: number) => {
        const response = await api.get(`/app/organizacion/${id}/testimonios-aprobados/`);
        return response.data;
    },

    // Agregar editores a una organización (solo editor de la org o admin)
    addEditors: async (id: number, editores: number[]) => {
        const response = await api.post(`/app/organizacion/${id}/agregar-editores/`, { editores });
        return response.data;
    },

    // Agregar visitantes a una organización (solo editor de la org o admin)
    addVisitantes: async (id: number, visitantes: number[]) => {
        const response = await api.post(`/app/organizacion/${id}/agregar-visitantes/`, { visitantes });
        return response.data;
    },

    // Obtener lista de todos los visitantes disponibles (para editores)
    getVisitantes: async () => {
        const response = await api.get('/app/visitantes/');
        return response.data;
    },
};
