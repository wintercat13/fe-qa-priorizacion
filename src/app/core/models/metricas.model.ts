export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface FiltroDashboard extends RangoFechas {
  responsableId?: number | null;
}

export interface KpisDashboard {
  totalCasos: number;
  prioridadAlta: number;
  porcentajeEjecutados: number;
  duplicadosDetectados: number;
}

export interface CasoPorModulo {
  nombre: string;
  valor: number;
}

export interface EstadoEjecucion {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface MetricasDashboard {
  kpis: KpisDashboard;
  casosPorModulo: CasoPorModulo[];
  estadoEjecucion: EstadoEjecucion[];
}

export interface MetricasReporte {
  cobertura: number;
  porcentajeEjecutado: number;
  casosObsoletosDepurados: number;
  cumplimientoSLA: number;
}

export interface TendenciaDashboard {
  periodo: string;
  cantidad: number;
}

export interface MetricaTendencia {
  periodo: string;
  ejecutados: number;
  pendientes: number;
  bloqueados: number;
}

export type AgrupacionTendencia = 'dia' | 'semana' | 'mes';
