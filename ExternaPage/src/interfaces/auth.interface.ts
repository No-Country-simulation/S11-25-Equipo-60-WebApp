import type { UserRole } from "@/interfaces";

export interface UserData {
  id: number;
  username: string;
  email: string;
  date_joined: string;
  role: UserRole;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  rol: string; // "administrador", "visitante", "editor", "sin_grupo"
  access: string;
  refresh?: string; // El backend puede incluir refresh token
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  date_joined: string;
  profile_picture_url?: string;
}