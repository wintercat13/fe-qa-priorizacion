import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { RangoFechas } from '../models/metricas.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1/reportes';

  exportarPdf(rango: RangoFechas): Observable<Blob> {
    const params = new URLSearchParams();
    params.set('formato', 'pdf');
    params.set('desde', rango.desde);
    params.set('hasta', rango.hasta);

    return this.http
      .get(`${this.baseUrl}/export?${params.toString()}`, {
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
