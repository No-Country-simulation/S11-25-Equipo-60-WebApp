import api from '@/lib/api';

export interface Testimonio {
    id?: number;
    organizacion: number;
    organizacion_nombre?: string;
    usuario_registrado?: string;
    usuario_anonimo_email?: string;
    usuario_anonimo_username?: string;
    api_key?: string;
    categoria: number;
    categoria_nombre?: string;
    comentario: string;
    archivo?: string;
    fecha_comentario?: string;
    ranking: string; // Decimal como string, ej: "5.0"
    estado?: string; // E, A, R, P, B, O
}

// Obtener todos los testimonios del visitante
export const testimonialService = {
    // Obtener testimonios creados por el visitante actual
    getMyTestimonials: async () => {
        try {
            const response = await api.get('/app/testimonios-totales/');
            return response.data;
        } catch (error: any) {
            // Si es 401, significa que el backend tiene un problema de permisos para este endpoint
            // Logueamos el error y lo relanzamos
            if (error.response?.status === 401) {
                console.error('⚠️ [Service] Backend rechazó el token (401) en /app/testimonios-totales/');
                console.error('⚠️ [Service] Esto es un error de permisos del backend. El usuario está autenticado pero el endpoint rechaza el acceso.');
                throw error; // Relanzamos el error para que la UI pueda manejarlo
            }
            throw error;
        }
    },

    // Obtener un testimonio específico
    getTestimonial: async (id: number) => {
        const response = await api.get(`/app/testimonios-totales/${id}/`);
        return response.data;
    },

    // Crear un nuevo testimonio
    createTestimonial: async (data: FormData | Partial<Testimonio>) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

        console.log('🚀 [Service] createTestimonial called');
        console.log('📦 [Service] Data type:', isFormData ? 'FormData' : 'JSON');

        if (isFormData) {
            // Log FormData entries for debugging
            const entries: Record<string, any> = {};
            data.forEach((value, key) => {
                entries[key] = value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value;
            });
            console.log('📝 [Service] FormData entries:', entries);
        } else {
            console.log('📝 [Service] Data:', data);
        }

        try {
            const headers = isFormData
                ? { 'Content-Type': 'multipart/form-data' }
                : { 'Content-Type': 'application/json' };

            console.log('🔧 [Service] Headers:', headers);

            const response = await api.post('/app/testimonios/', data, {
                headers: headers,
            });

            console.log('✅ [Service] Response success:', response.status, response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ [Service] Error creating testimonial:', error);
            if (error.response) {
                console.error('❌ [Service] Error status:', error.response.status);
                console.error('❌ [Service] Error data:', error.response.data);
                console.error('❌ [Service] Error headers:', error.response.headers);
            }
            throw error;
        }
    },

    // Actualizar un testimonio
    updateTestimonial: async (id: number, data: Partial<Testimonio>) => {
        const response = await api.patch(`/app/testimonios/${id}/`, data);
        return response.data;
    },

    // Eliminar un testimonio
    deleteTestimonial: async (id: number) => {
        const response = await api.delete(`/app/testimonios/${id}/`);
        return response.data;
    },

    // Obtener todos los testimonios públicos (aprobados)
    getPublicTestimonials: async () => {
        const response = await api.get('/app/testimonios/');
        return response.data;
    },
};
