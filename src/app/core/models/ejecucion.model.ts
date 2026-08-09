export const RESULTADOS_EJECUCION = ['APROBADO', 'FALLIDO', 'BLOQUEADO'] as const;
export type ResultadoEjecucion = (typeof RESULTADOS_EJECUCION)[number];

export interface EjecucionPayload {
  casoPruebaId: number;
  resultado: ResultadoEjecucion;
  observaciones?: string;
}

export interface EjecucionResponse {
  id: number;
  casoPruebaId: number;
  resultado: ResultadoEjecucion;
  estadoCaso: string;
  fechaEjecucion: string;
}
