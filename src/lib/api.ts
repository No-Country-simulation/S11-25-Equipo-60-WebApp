import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
    // Solo agregar token desde localStorage si no hay un Authorization header ya configurado
    if (typeof window !== 'undefined' && !config.headers.Authorization) {
        const storage = localStorage.getItem('auth-storage');
        if (storage) {
            const { state } = JSON.parse(storage);
            if (state?.token) {
                config.headers.Authorization = `Bearer ${state.token}`;
                console.log('🔑 Token agregado al request:', state.token.substring(0, 20) + '...');
            } else {
                console.warn('⚠️ No hay token en el store');
            }
        } else {
            console.warn('⚠️ No hay auth-storage en localStorage');
        }
    }
    console.log('📤 Request:', config.method?.toUpperCase(), config.url, 'Headers:', config.headers.Authorization ? '✅ Con token' : '❌ Sin token');
    return config;
});

export default api;
