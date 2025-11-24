import api from '@/lib/api';

export interface Organizacion {
    id: number;
    organizacion_nombre: string;
    dominio: string;
    api_key?: string;
}

export const organizationService = {
    // Obtener todas las organizaciones
    getOrganizations: async () => {
        const response = await api.get('/app/organizacion/');
        return response.data;
    },

    // Obtener una organización específica
    getOrganization: async (id: number) => {
        const response = await api.get(`/app/organizacion/${id}/`);
        return response.data;
    },

    // Obtener testimonios aprobados de una organización
    getApprovedTestimonials: async (id: number) => {
        const response = await api.get(`/app/organizacion/${id}/testimonios-aprobados/`);
        return response.data;
    },
};
