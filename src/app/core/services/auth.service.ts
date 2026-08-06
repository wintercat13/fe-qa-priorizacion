import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { AuthResponse, LoginPayload, RolUsuario, Usuario } from '../models/usuario.model';

export interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY_TOKEN = 'qa_token';
const STORAGE_KEY_USER = 'qa_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly state = signal<AuthState>({
    usuario: this.readStoredUser(),
    token: this.readStoredToken(),
    isAuthenticated: !!this.readStoredToken(),
  });

  readonly authState = this.state.asReadonly();

  login(payload: LoginPayload): Observable<Usuario> {
    return this.http
      .post<AuthResponse>('/api/v1/auth/login', payload)
      .pipe(
        tap((response) => {
          const { token, usuario } = response.data;
          this.storeSession(token, usuario);
        }),
        map((response) => response.data.usuario),
        catchError((error: HttpErrorResponse) => this.handleLoginError(error))
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    this.state.set({ usuario: null, token: null, isAuthenticated: false });
    void this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.state().token ?? this.readStoredToken();
  }

  getUsuario(): Usuario | null {
    return this.state().usuario ?? this.readStoredUser();
  }

  hasRol(roles: RolUsuario[]): boolean {
    const usuario = this.getUsuario();
    return !!usuario && roles.includes(usuario.rol);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  private storeSession(token: string, usuario: Usuario): void {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(usuario));
    this.state.set({ usuario, token, isAuthenticated: true });
  }

  private readStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  }

  private readStoredUser(): Usuario | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }

  private handleLoginError(error: HttpErrorResponse): Observable<never> {
    let mensaje = 'Ocurrió un error inesperado. Intenta nuevamente.';

    if (error.status === 401) {
      mensaje = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    } else if (error.status === 403) {
      mensaje = 'Tu cuenta está inactiva. Contacta al administrador QA.';
    } else if (error.status === 400) {
      mensaje = 'Datos inválidos. Verifica el formato de tu correo.';
    } else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(mensaje));
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      return !!payload.exp && payload.exp * 1000 < Date.now();
    } catch {
      return false;
    }
  }
}
