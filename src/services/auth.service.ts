import api from '@/lib/api';

type UserRole = 'visitante' | 'editor' | 'admin';

interface UserData {
    id: number;
    username: string;
    email: string;
    date_joined: string;
    role: UserRole;
}

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/app/login/', credentials);
        return response.data;
    },

    register: async (data: any) => {
        const response = await api.post('/app/visitantes/', data);
        return response.data;
    },

    refreshToken: async (refresh: string) => {
        const response = await api.post('/app/token/refresh/', { refresh });
        return response.data;
    },

    // Obtener datos del usuario y detectar su rol
    getUserData: async (userId: number, token: string): Promise<UserData> => {
        // Configurar headers con el token para estas peticiones
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        console.log('🔑 Enviando petición con token:', token.substring(0, 20) + '...');
        console.log('📋 Config headers:', config);

        // Intentar obtener datos como visitante
        try {
            const response = await api.get(`/app/visitantes/${userId}/`, config);
            return { ...response.data, role: 'visitante' as const };
        } catch (error: any) {
            // Si falla, intentar como editor
            if (error.response?.status === 403 || error.response?.status === 404) {
                try {
                    const response = await api.get(`/app/editores/${userId}/`, config);
                    return { ...response.data, role: 'editor' as const };
                } catch (editorError: any) {
                    // Si falla, intentar como admin
                    if (editorError.response?.status === 403 || editorError.response?.status === 404) {
                        const response = await api.get(`/app/administradores/${userId}/`, config);
                        return { ...response.data, role: 'admin' as const };
                    }
                    throw editorError;
                }
            }
            throw error;
        }
    }
};
