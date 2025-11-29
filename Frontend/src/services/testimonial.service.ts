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

/**
 * Servicio de Testimonios
 * 
 * IMPORTANTE: El endpoint /app/testimonios-totales/ tiene DOBLE FUNCIONALIDAD según el rol del usuario:
 * 
 * - VISITANTE: Devuelve testimonios que EL USUARIO CREÓ (como cliente)
 * - EDITOR: Devuelve testimonios de LAS ORGANIZACIONES a las que pertenece (como staff)
 * - ADMIN: NO DEBE USAR ESTE ENDPOINT (usar getPublicTestimonials en su lugar)
 * 
 * El backend detecta automáticamente el rol desde el token JWT y devuelve los datos correspondientes.
 */
export const testimonialService = {
    /**
     * GET /app/testimonios-totales/
     * 
     * Función dual según el rol del usuario autenticado:
     * - VISITANTE: Obtiene testimonios que el usuario creó personalmente
     * - EDITOR: Obtiene testimonios de las organizaciones que gestiona
     * 
     * @returns Array de testimonios (filtrado automáticamente por el backend según rol)
     */
    getMyTestimonials: async () => {
        try {
            console.log('📞 Llamando GET /app/testimonios-totales/');
            
            // Verificar que hay token antes de hacer la petición
            if (typeof window !== 'undefined') {
                const storage = localStorage.getItem('auth-storage');
                if (!storage) {
                    throw new Error('No hay sesión activa. Por favor inicia sesión.');
                }
                const { state } = JSON.parse(storage);
                if (!state?.token) {
                    throw new Error('No hay token de autenticación. Por favor inicia sesión.');
                }
                if (!state?.user) {
                    throw new Error('No hay datos de usuario. Por favor inicia sesión nuevamente.');
                }
                console.log('🔐 Usuario logueado:', {
                    id: state.user.id,
                    email: state.user.email,
                    role: state.user.role
                });
            }
            
            const response = await api.get('/app/testimonios-totales/');
            console.log('✅ Testimonios obtenidos:', response.data.length, 'testimonios');
            return response.data;
        } catch (error: any) {
            // Si es 401, el backend rechaza el token por permisos
            if (error.response?.status === 401) {
                console.error('❌ [401 Unauthorized] El backend rechazó el acceso');
                console.error('📋 Posibles causas:');
                console.error('   1. El usuario no tiene el rol correcto en el backend');
                console.error('   2. El token expiró (verifica que el backend esté generando tokens con tiempo suficiente)');
                console.error('   3. El backend tiene un bug en los permisos del endpoint');
                console.error('   4. Necesitas cerrar sesión y volver a iniciar sesión');
                console.error('');
                console.error('💡 Solución sugerida:');
                console.error('   - Cierra sesión (botón en el dashboard)');
                console.error('   - Vuelve a iniciar sesión');
                console.error('   - Si persiste, contacta al equipo de backend');
                
                throw new Error('No tienes permisos para acceder a tus testimonios. Por favor cierra sesión y vuelve a iniciar sesión. Si el problema persiste, contacta al administrador.');
            }
            
            // Para otros errores
            console.error('❌ Error obteniendo testimonios:', error.message);
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

    /**
     * GET /app/testimonios/
     * 
     * Obtiene TODOS los testimonios APROBADOS de TODAS las organizaciones.
     * Este endpoint es PÚBLICO (no requiere autenticación).
     * 
     * Usado por:
     * - Admin: Para ver todos los testimonios públicos del sistema
     * - Landing page: Para mostrar testimonios aprobados al público
     * 
     * @returns Array de testimonios aprobados públicos
     */
    getPublicTestimonials: async () => {
        const response = await api.get('/app/testimonios/');
        return response.data;
    },

    // Cambiar estado de un testimonio (solo editor de la organización)
    changeTestimonialStatus: async (id: number, estado: 'E' | 'A' | 'R' | 'P' | 'B' | 'O') => {
        const response = await api.patch(`/app/testimonios-cambiar-estado/${id}/`, { estado });
        return response.data;
    },

    // Obtener estadísticas de testimonios (solo editores)
    getStatistics: async () => {
        const response = await api.get('/app/testimonios-totales/estadisticas/');
        return response.data;
    },
};
