import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse, UsuarioCompleto, UsuarioPayload } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/usuarios';

  listar(): Observable<UsuarioCompleto[]> {
    return this.http
      .get<ApiResponse<UsuarioCompleto[]>>(this.baseUrl)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo cargar el listado de usuarios.'))
      );
  }

  crear(payload: UsuarioPayload): Observable<UsuarioCompleto> {
    return this.http
      .post<ApiResponse<UsuarioCompleto>>(this.baseUrl, payload)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo crear el usuario.'))
      );
  }

  editar(id: number, payload: UsuarioPayload): Observable<UsuarioCompleto> {
    return this.http
      .put<ApiResponse<UsuarioCompleto>>(`${this.baseUrl}/${id}`, payload)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo actualizar el usuario.'))
      );
  }

  desactivar(id: number): Observable<UsuarioCompleto> {
    return this.http
      .put<ApiResponse<UsuarioCompleto>>(`${this.baseUrl}/${id}/desactivar`, {})
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo desactivar el usuario.'))
      );
  }

  private handleError(error: HttpErrorResponse, fallback: string): Observable<never> {
    let mensaje = fallback;

    if (error.status === 401) {
      mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 422) {
      mensaje = 'El correo corporativo ya está registrado.';
    } else if (error.status === 400) {
      mensaje = 'Datos inválidos. Verifica la información ingresada.';
    } else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(mensaje));
  }
}
