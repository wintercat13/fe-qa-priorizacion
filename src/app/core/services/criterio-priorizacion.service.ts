import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/usuario.model';
import {
  ActualizacionCriteriosPayload,
  ActualizacionCriteriosResponse,
  CriterioPriorizacion,
} from '../models/criterio-priorizacion.model';

@Injectable({ providedIn: 'root' })
export class CriterioPriorizacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/criterios-priorizacion';

  listar(): Observable<CriterioPriorizacion[]> {
    return this.http
      .get<ApiResponse<CriterioPriorizacion[]>>(this.baseUrl)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo cargar los criterios de priorización.'))
      );
  }

  actualizar(payload: ActualizacionCriteriosPayload): Observable<ActualizacionCriteriosResponse> {
    return this.http
      .put<ApiResponse<ActualizacionCriteriosResponse>>(this.baseUrl, payload)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo guardar la configuración.'))
      );
  }

  private handleError(error: HttpErrorResponse, fallback: string): Observable<never> {
    let mensaje = fallback;

    if (error.status === 401) {
      mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 422) {
      mensaje = 'La suma de los pesos debe ser exactamente 100%.';
    } else if (error.status === 400) {
      mensaje = 'Solicitud inválida. Verifica la información ingresada.';
    } else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(mensaje));
  }
}
