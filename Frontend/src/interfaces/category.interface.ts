export interface Categoria {
  id: number;
  nombre_categoria: string;
  icono: string; // Requerido - nombre del icono
  color: string; // Requerido - código de color hex
  fecha_registro?: string;
}