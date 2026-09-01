import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/usuario.model';
import {
  AgrupacionTendencia,
  FiltroDashboard,
  MetricaTendencia,
  MetricasDashboard,
} from '../models/metricas.model';

@Injectable({ providedIn: 'root' })
export class MetricasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/dashboard';

  private buildParams(filtro?: Partial<FiltroDashboard>): HttpParams {
    let params = new HttpParams();
    if (filtro?.desde) {
      params = params.set('desde', filtro.desde);
    }
    if (filtro?.hasta) {
      params = params.set('hasta', filtro.hasta);
    }
    if (filtro?.responsableId) {
      params = params.set('responsableId', filtro.responsableId.toString());
    }
    return params;
  }

  obtener(filtro?: Partial<FiltroDashboard>): Observable<MetricasDashboard> {
    return this.http
      .get<ApiResponse<MetricasDashboard>>(this.baseUrl, { params: this.buildParams(filtro) })
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudieron cargar las métricas.'))
      );
  }

  obtenerTendencias(
    filtro: Partial<FiltroDashboard>,
    agrupacion: AgrupacionTendencia = 'semana'
  ): Observable<MetricaTendencia[]> {
    const params = this.buildParams(filtro).set('agrupacion', agrupacion);
    return this.http
      .get<ApiResponse<MetricaTendencia[]>>(`${this.baseUrl}/tendencias`, { params })
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'No se pudieron cargar las tendencias.'))
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
