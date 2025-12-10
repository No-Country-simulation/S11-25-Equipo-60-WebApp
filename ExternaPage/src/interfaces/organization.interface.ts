
export interface Editor {
    id: number;
    email: string;
    username: string;
}

export interface Organizacion {
    id: number;
    organizacion_nombre: string;
    dominio: string;
    api_key?: string;
    editores?: string | Editor[]; // Puede ser string o array de objetos Editor
}
