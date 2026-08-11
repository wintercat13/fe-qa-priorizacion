import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/usuario.model';
import { Trazabilidad } from '../models/trazabilidad.model';

@Injectable({ providedIn: 'root' })
export class TrazabilidadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/trazabilidad';

  obtener(casoPruebaId: number): Observable<Trazabilidad> {
    return this.http
      .get<ApiResponse<Trazabilidad>>(`${this.baseUrl}/${casoPruebaId}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudo cargar la trazabilidad.', true))
      );
  }

  private handleError(error: HttpErrorResponse, fallback: string, notFound = false): Observable<never> {
    let mensaje = fallback;

    if (error.status === 404 && notFound) {
      mensaje = 'El caso de prueba o requisito no existe o no está disponible.';
    } else if (error.status === 401) {
      mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(mensaje));
  }
}
