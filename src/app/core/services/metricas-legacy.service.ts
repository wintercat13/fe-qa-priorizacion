import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/usuario.model';
import { MetricasReporte, RangoFechas } from '../models/metricas.model';

@Injectable({ providedIn: 'root' })
export class MetricasLegacyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/metricas';

  obtener(rango: RangoFechas): Observable<MetricasReporte> {
    let params = new HttpParams().set('desde', rango.desde).set('hasta', rango.hasta);

    return this.http
      .get<ApiResponse<MetricasReporte>>(this.baseUrl, { params })
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudieron cargar las métricas del reporte.'))
      );
  }


  private handleError(error: HttpErrorResponse, fallback: string): Observable<never> {
    let mensaje = fallback;

    if (error.status === 401) {
      mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    } else if (error.status === 400) {
      mensaje = 'Rango de fechas inválido.';
    } else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(mensaje));
  }
}
