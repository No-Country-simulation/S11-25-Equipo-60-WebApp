export type UserRole = 'visitante' | 'editor' | 'admin' | 'sin_grupo';

export interface RoleConfig {
    role: UserRole;
    router: string;
}