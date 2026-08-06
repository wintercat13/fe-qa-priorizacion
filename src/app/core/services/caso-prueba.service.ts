import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/usuario.model';
import { CasoPrueba, CasoPruebaPayload, Requisito } from '../models/caso-prueba.model';

@Injectable({ providedIn: 'root' })
export class CasoPruebaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/casos-prueba';

  listar(): Observable<CasoPrueba[]> {
    return this.http
      .get<ApiResponse<CasoPrueba[]>>(this.baseUrl)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo cargar los casos de prueba.'))
      );
  }

  crear(payload: CasoPruebaPayload): Observable<CasoPrueba> {
    return this.http
      .post<ApiResponse<CasoPrueba>>(this.baseUrl, payload)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo registrar el caso de prueba.'))
      );
  }

  listarRequisitos(): Observable<Requisito[]> {
    return this.http
      .get<ApiResponse<Requisito[]>>('/api/v1/requisitos')
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudieron cargar los requisitos.'))
      );
  }

  private handleError(error: HttpErrorResponse, fallback: string): Observable<never> {
    let mensaje = fallback;

    if (error.status === 401) {
      mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 422) {
      mensaje = 'Datos inválidos. Revisa los campos del formulario.';
    } else if (error.status === 400) {
      mensaje = 'Solicitud inválida. Verifica la información ingresada.';
    } else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(mensaje));
  }
}
