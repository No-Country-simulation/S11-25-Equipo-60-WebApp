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
        // Configurar headers con el token JWT para estas peticiones
        const config = {
            headers: {
                'Authorization': `JWT ${token}` // Backend requiere prefijo "JWT", no "Bearer"
            }
        };

        console.log('🔑 Detectando rol del usuario ID:', userId);

        // Intentar obtener datos como visitante primero (el más común)
        try {
            const response = await api.get(`/app/visitantes/${userId}/`, config);
            console.log('✅ Usuario detectado como VISITANTE');
            return { ...response.data, role: 'visitante' as const };
        } catch (visitanteError: any) {
            console.log('❌ No es visitante, intentando editor...');
            
            // Si falla (403 o 404), intentar como editor
            if (visitanteError.response?.status === 403 || visitanteError.response?.status === 404) {
                try {
                    const response = await api.get(`/app/editores/${userId}/`, config);
                    console.log('✅ Usuario detectado como EDITOR');
                    return { ...response.data, role: 'editor' as const };
                } catch (editorError: any) {
                    console.log('❌ No es editor, intentando admin...');
                    
                    // Si falla (403 o 404), intentar como admin
                    if (editorError.response?.status === 403 || editorError.response?.status === 404) {
                        try {
                            const response = await api.get(`/app/administradores/${userId}/`, config);
                            console.log('✅ Usuario detectado como ADMIN');
                            return { ...response.data, role: 'admin' as const };
                        } catch (adminError: any) {
                            console.error('❌ No se pudo determinar el rol del usuario');
                            throw new Error('No se pudo obtener información del usuario. El usuario no existe en ningún endpoint.');
                        }
                    }
                    throw editorError;
                }
            }
            throw visitanteError;
        }
    }
};
