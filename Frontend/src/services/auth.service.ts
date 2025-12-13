import { api } from "@/api";
import type { LoginResponse, RegisterResponse, RoleConfig, UserCredentials, Usuario } from "@/interfaces";

const ROLES: RoleConfig[] = [
    { role: 'admin', router: 'administradores' },
    { role: 'editor', router: 'editores' },
    { role: 'visitante', router: 'visitantes' }
];

const isValidRole = async ( userId: number, token: string ,router: string) => {
    try{
        const response = await api.get( `/app/${ router }/${ userId }/`,
            { headers: { 'Authorization': `JWT ${ token }` } }
        );
        return response;
    } catch {
        return null;
    }
}

const findUserRole = async (userId: number, token: string): Promise<RoleConfig | null> => {
    for (const { role, router } of ROLES) {
        const roleData = await isValidRole(userId, token, router);
        if (roleData?.status === 200) {
            return { ...roleData.data, role };
        }
    }
    return null;
};

const logUserDetection = ( userId: number, userRole: RoleConfig | null ): void =>
{
    const msn = userRole
        ? `✅ Usuario ${ userId } detectado como ${ userRole.role.toUpperCase() }`
        : `❌ No se pudo determinar el rol del usuario ${ userId }`
    console.log( msn );
}

const validateUserRole = (userRole: RoleConfig | null): void => {
    if (!userRole) {
        throw new Error('Usuario no encontrado en ningún endpoint');
    }
};

export const authService = {
    login: async ( credentials: UserCredentials ): Promise<LoginResponse> => {
        const response = await api.post( '/app/login/', credentials );
        return response.data;
    },

    register: async (data: Usuario): Promise<RegisterResponse> => {
        const response = await api.post('/app/visitantes/', data);
        return response.data;
    },

    refreshToken: async (refresh: string): Promise<any> => {
        const response = await api.post('/app/token/refresh/', { refresh });
        return response.data;
    },

    getUserData: async ( userId: number, token: string ): Promise<any> => {
        console.log( '🔑 Detectando rol del usuario ID:', userId );
        const userRole = await findUserRole(userId, token);
        logUserDetection( userId, userRole );
        validateUserRole(userRole);
        return userRole;
    }
,

    // Enviar email para reset de contraseña
    requestPasswordReset: async ( email: { email: string } ): Promise<any> => {
        const response = await api.post('/app/auth/reset/password/', email);
        return response.data;
    },

    // Confirmar y establecer nueva contraseña
    confirmPasswordReset: async ( payload: { uid: string; token: string; new_password: string } ): Promise<any> => {
        const response = await api.post('/app/auth/reset/password/confirm/', payload);
        return response.data;
    }
};
