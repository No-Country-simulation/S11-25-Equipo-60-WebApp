export interface Usuario {
  id?: number;
  username: string;
  email: string;
  date_joined?: string;
  password?: string; // writeOnly - solo para crear/actualizar
  profile_picture?: string; // writeOnly - URI para subir imagen
  profile_picture_url?: string; // readOnly - URL de la imagen subida
}
