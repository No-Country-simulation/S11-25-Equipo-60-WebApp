import api from '@/lib/api';

export interface Usuario {
    id: number;
    username: string;
    email: string;
    date_joined: string;
    password?: string;
}

export const userService = {
    // VISITANTES
    getVisitantes: async () => {
        const response = await api.get('/app/visitantes/');
        return response.data;
    },

    getVisitante: async (id: number) => {
        const response = await api.get(`/app/visitantes/${id}/`);
        return response.data;
    },

    createVisitante: async (data: Partial<Usuario>) => {
        const response = await api.post('/app/visitantes/', data);
        return response.data;
    },

    updateVisitante: async (id: number, data: Partial<Usuario>) => {
        const response = await api.patch(`/app/visitantes/${id}/`, data);
        return response.data;
    },

    deleteVisitante: async (id: number) => {
        const response = await api.delete(`/app/visitantes/${id}/`);
        return response.data;
    },

    // EDITORES
    getEditores: async () => {
        const response = await api.get('/app/editores/');
        return response.data;
    },

    getEditor: async (id: number) => {
        const response = await api.get(`/app/editores/${id}/`);
        return response.data;
    },

    updateEditor: async (id: number, data: Partial<Usuario>) => {
        const response = await api.patch(`/app/editores/${id}/`, data);
        return response.data;
    },

    deleteEditor: async (id: number) => {
        const response = await api.delete(`/app/editores/${id}/`);
        return response.data;
    },

    // ADMINISTRADORES
    getAdministradores: async () => {
        const response = await api.get('/app/administradores/');
        return response.data;
    },

    getAdministrador: async (id: number) => {
        const response = await api.get(`/app/administradores/${id}/`);
        return response.data;
    },

    createAdministrador: async (data: Partial<Usuario>) => {
        const response = await api.post('/app/administradores/', data);
        return response.data;
    },

    updateAdministrador: async (id: number, data: Partial<Usuario>) => {
        const response = await api.patch(`/app/administradores/${id}/`, data);
        return response.data;
    },

    deleteAdministrador: async (id: number) => {
        const response = await api.delete(`/app/administradores/${id}/`);
        return response.data;
    },
};
