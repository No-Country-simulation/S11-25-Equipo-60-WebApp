import type { UserRole } from "@/interfaces";

export interface UserData {
  id: number;
  username: string;
  email: string;
  date_joined: string;
  role: UserRole;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  access: string;
}

export interface RegisterResponse
{
  mensage: string;
  user_id: number;
}