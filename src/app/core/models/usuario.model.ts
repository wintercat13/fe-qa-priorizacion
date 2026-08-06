export type RolUsuario = 'QA_TESTER' | 'ADMINISTRADOR_QA' | 'DESARROLLADOR';

export interface Usuario {
  id: number;
  nombre: string;
  rol: RolUsuario;
}

export interface LoginPayload {
  correo: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  usuario: Usuario;
}

export interface AuthResponse {
  status: string;
  data: AuthResponseData;
}
