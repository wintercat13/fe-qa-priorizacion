import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export interface FiltroExporteReporte {
  desde: string;
  hasta: string;
  responsableId?: number | null;
  modulo?: string;
  prioridad?: string;
  estado?: string;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reportes';

  exportarPdf(filtro: FiltroExporteReporte): Observable<Blob> {
    let params = new HttpParams()
      .set('formato', 'pdf')
      .set('desde', filtro.desde)
      .set('hasta', filtro.hasta);

    if (filtro.responsableId) {
      params = params.set('responsableId', filtro.responsableId.toString());
    }
    if (filtro.modulo) {
      params = params.set('modulo', filtro.modulo);
    }
    if (filtro.prioridad) {
      params = params.set('prioridad', filtro.prioridad);
    }
    if (filtro.estado) {
      params = params.set('estado', filtro.estado);
    }

    return this.http
      .get(`${this.baseUrl}/export`, {
        params,
        responseType: 'blob',
      })
      .pipe(
        catchError((error) => this.handleError(error, 'No se pudo generar el reporte.'))
      );
  }

  private handleError(error: HttpErrorResponse, fallback: string): Observable<never> {
    let mensaje = fallback;

    if (error.status === 401) {
      mensaje = 'Tu sesión expiró. Vuelve a iniciar sesión.';
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para generar reportes.';
    } else if (error.status === 404) {
      mensaje = 'No hay datos suficientes para generar el reporte en el período seleccionado.';
    } else if (error.status === 500) {
      mensaje = 'Ocurrió un error al generar el PDF. Intenta nuevamente.';
    } else if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return throwError(() => new Error(mensaje));
  }
}
