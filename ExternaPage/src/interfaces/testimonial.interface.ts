/**
 * Estados de testimonio:
 * E = ESPERA, A = APROBADO, R = RECHAZADO
 * P = PUBLICADO, B = BORRADOR, O = OCULTO
 */
export type EstadoTestimonio = 'E' | 'A' | 'R' | 'P' | 'B' | 'O';

/**
 * Interfaz para el usuario registrado en un testimonio
 */
export interface UsuarioTestimonio {
  id: number;
  email: string;
  username: string;
}

export interface Testimonio {
  id?: number;
  organizacion: number;
  organizacion_nombre?: string;
  usuario_registrado?: string | UsuarioTestimonio; // Puede ser string (username) o objeto completo
  usuario_anonimo_email?: string;
  usuario_anonimo_username?: string;
  api_key?: string;
  categoria: number;
  categoria_nombre?: string;
  comentario: string;
  enlace?: string; // URL externa relacionada
  archivos?: string[]; // Array de archivos (máx 4) - writeOnly para POST
  archivos_urls?: string[]; // URLs de archivos subidos - readOnly
  fecha_comentario?: string;
  ranking: string; // Decimal como string, ej: "5.0"
  estado?: EstadoTestimonio; // Estado del testimonio
}

/**
 * Interfaz para testimonios aprobados públicos
 * Usado en endpoint GET /app/organizacion/{id}/testimonios-aprobados/
 */
export interface TestimonioAprobado {
  id: number;
  usuario_registrado: string;
  usuario_anonimo_email?: string;
  usuario_anonimo_username?: string;
  api_key: string;
  categoria: number;
  categoria_nombre: string;
  comentario?: string;
  fecha_comentario: string;
  ranking?: string; // Decimal como string
}