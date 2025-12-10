export type UserRole = 'visitante' | 'editor' | 'administrador' | 'sin_grupo';

export interface RoleConfig {
    role: UserRole;
    router: string;
}