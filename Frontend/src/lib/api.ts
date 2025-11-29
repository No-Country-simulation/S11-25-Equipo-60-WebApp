import axios from 'axios';
import { logger } from './logger';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://apptestimonial.vercel.app',
});

api.interceptors.request.use((config) => {
    // Siempre intentar agregar token desde localStorage en el navegador
    if (typeof window !== 'undefined') {
        const storage = localStorage.getItem('auth-storage');
        if (storage) {
            try {
                const { state } = JSON.parse(storage);
                if (state?.token && state.token !== 'undefined') {
                    // CRÍTICO: El backend espera "JWT" como prefijo, NO "Bearer"
                    // Según la documentación: "Token-based authentication with required prefix 'JWT'"
                    config.headers['Authorization'] = `JWT ${state.token}`;
                    
                    logger.auth('✅ Token agregado con prefijo JWT:', state.token.substring(0, 30) + '...');
                    logger.debug('🔍 Header configurado:', config.headers['Authorization'].substring(0, 50) + '...');
                } else {
                    logger.warn('⚠️ Token inválido en store');
                }
            } catch (error) {
                logger.error('❌ Error parseando auth-storage:', error);
            }
        } else {
            logger.warn('⚠️ No hay auth-storage en localStorage');
        }
    }
    
    // Verificar si el header se agregó correctamente
    logger.debug(`📤 Request ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
});

// Interceptor para respuestas
api.interceptors.response.use(
    (response) => {
        logger.api(
            response.config.method?.toUpperCase() || 'UNKNOWN',
            response.config.url || '',
            response.status
        );
        return response;
    },
    (error) => {
        if (error.response) {
            logger.error(
                `API Error: ${error.response.status} - ${error.config.method?.toUpperCase()} ${error.config.url}`,
                error.response.data
            );
        } else if (error.request) {
            logger.error('Network Error: No response received', error.message);
        } else {
            logger.error('Request Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
