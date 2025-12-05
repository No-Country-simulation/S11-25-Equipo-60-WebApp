export interface Testimonio {
  id?: number;
  organizacion: number;
  organizacion_nombre?: string;
  usuario_registrado?: string;
  usuario_anonimo_email?: string;
  usuario_anonimo_username?: string;
  api_key?: string;
  categoria: number;
  categoria_nombre?: string;
  comentario: string;
  archivo?: string;
  fecha_comentario?: string;
  ranking: string; // Decimal como string, ej: "5.0"
  estado?: string; // E, A, R, P, B, O
}