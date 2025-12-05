
export interface Organizacion {
    id: number;
    organizacion_nombre: string;
    dominio: string;
    api_key?: string;
    editores?: string; // Para el endpoint de organizaciones del editor
}