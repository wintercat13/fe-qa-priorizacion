export const ROLES_USUARIO = ['QA_TESTER', 'ADMINISTRADOR_QA', 'DESARROLLADOR'] as const;
export type RolUsuario = (typeof ROLES_USUARIO)[number];

export interface Usuario {
  id: number;
  nombre: string;
  rol: RolUsuario;
}

export interface UsuarioCompleto extends Usuario {
  correo: string;
  activo: boolean;
}

export interface LoginPayload {
  correo: string;
  password: string;
}

export interface UsuarioPayload {
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

export interface AuthResponseData {
  token: string;
  usuario: Usuario;
}

export interface AuthResponse {
  status: string;
  data: AuthResponseData;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
