import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/usuario.model';
import { EjecucionPayload, EjecucionResponse } from '../models/ejecucion.model';

@Injectable({ providedIn: 'root' })
export class EjecucionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/ejecuciones';

  registrar(payload: EjecucionPayload): Observable<EjecucionResponse> {
    return this.http
      .post<ApiResponse<EjecucionResponse>>(this.baseUrl, payload)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo registrar la ejecución.'))
      );
  }

  private handleError(error: HttpErrorResponse, fallback: string): Observable<never> {
    let mensaje = fallback;

    if (error.status === 401) {
      mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 422) {
      mensaje = 'Datos inválidos. Verifica el resultado y las observaciones.';
    } else if (error.status === 400) {
      mensaje = 'Solicitud inválida. Verifica la información ingresada.';
    } else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(mensaje));
  }
}
