export type UserRole = 'visitante' | 'editor' | 'admin';

export interface RoleConfig {
    role: UserRole;
    router: string;
}